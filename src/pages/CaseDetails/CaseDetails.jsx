import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToCase, getDocumentsByCaseId, getCaseAnalysis } from '../../services/caseService';
import { getHearingsByCaseId } from '../../services/hearingService';
import { getFamilyUpdatesByCaseId } from '../../services/familyService';
import { ArrowLeft, FileText, BrainCircuit, Clock, Users, FileIcon, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import './CaseDetails.css';
import Courtroom from '../../components/Courtroom/Courtroom';
import { useAuth } from '../../contexts/AuthContext';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    caseInfo: null, documents: [], analysis: null, hearings: [], familyUpdates: []
  });
  const [loading, setLoading] = useState(true);
  const [showCourtroom, setShowCourtroom] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', id);
    formData.append('uploaded_by', userData?.role || 'family');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const result = await response.json();
      alert(`Document Analyzed Successfully!\nType: ${result.classification?.documentType}\nSummary: ${result.classification?.summary}`);
      
      // Refresh documents list
      const updatedDocs = await getDocumentsByCaseId(id);
      setData(prev => ({...prev, documents: updatedDocs}));
      
    } catch (err) {
      console.error(err);
      alert('Error uploading document. Ensure backend is running.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    let unsubscribe;

    const fetchData = async () => {
      try {
        const [documents, analysis, hearings, familyUpdates] = await Promise.all([
          getDocumentsByCaseId(id),
          getCaseAnalysis(id),
          getHearingsByCaseId(id),
          getFamilyUpdatesByCaseId(id)
        ]);

        setData(prev => ({ ...prev, documents, analysis, hearings, familyUpdates }));
        
        // Setup real-time listener for the case
        unsubscribe = subscribeToCase(id, (updatedCase) => {
          setData(prev => ({ ...prev, caseInfo: updatedCase }));
          setLoading(false);
          
          // If analysis completes in the background (e.g. for family member watching), fetch the new report
          if (updatedCase.analysisCompleted && !prev.analysis) {
            getCaseAnalysis(id).then(newAnalysis => {
              setData(curr => ({ ...curr, analysis: newAnalysis }));
            });
          }
        });

      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  if (loading) return <div className="loading-spinner" style={{ margin: 'auto' }}></div>;
  if (!data.caseInfo) return <div>Case not found</div>;

  const { caseInfo, analysis } = data;

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // Watermark
    doc.setTextColor(230, 230, 230);
    doc.setFontSize(80);
    doc.setFont('helvetica', 'bold');
    doc.text('JUSTICEGRID', 105, 150, { align: 'center', angle: 45 });
    
    // Header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text(`JUSTICEGRID JUDICIAL AI REPORT`, 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Case Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Undertrial Name:`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(caseInfo.undertrialName, 65, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Case ID:`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(caseInfo.caseId, 65, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Court:`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(caseInfo.court, 65, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Police Assessment:`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(caseInfo.policeAssessment, 65, yPos);
    yPos += 15;
    
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    // Transcript
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Multi-Agent Deliberation Transcript`, 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    if (analysis && analysis.transcript) {
      analysis.transcript.filter(t => t.finding || t.recommendation).forEach(msg => {
        doc.setFont('helvetica', 'bold');
        doc.text(`[${msg.speaker}] (Conf: ${msg.confidence}%)`, 20, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        
        if (msg.finding) {
          const findingLines = doc.splitTextToSize(`Finding: ${msg.finding}`, 170);
          doc.text(findingLines, 20, yPos);
          yPos += (findingLines.length * 5);
        }
        
        if (msg.recommendation) {
          const recLines = doc.splitTextToSize(`Recommendation: ${msg.recommendation}`, 170);
          doc.text(recLines, 20, yPos);
          yPos += (recLines.length * 5);
        }
        
        const reasoningLines = doc.splitTextToSize(`Reasoning: ${msg.message}`, 170);
        doc.text(reasoningLines, 20, yPos);
        yPos += (reasoningLines.length * 5) + 8;

        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    // Signature Block
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    yPos += 20;
    doc.line(120, yPos, 180, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('JusticeGrid Orchestrator', 125, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Generated via Multi-Agent Consensus', 125, yPos);

    doc.save(`JusticeGrid_Report_${caseInfo.caseId}.pdf`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText size={16} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileIcon size={16} /> },
    { id: 'ai', label: 'AI Analysis', icon: <BrainCircuit size={16} /> }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="case-details">
      <button className="btn-link" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Cases
      </button>

      <div className="card case-header-card">
        <div className="case-header-main">
          <h1>{caseInfo.undertrialName}</h1>
          <div className="case-badges">
            <span className={`badge badge-${caseInfo.priority === 'High' ? 'urgent' : 'pending'}`}>{caseInfo.priority} Priority</span>
            <span className={`badge badge-${caseInfo.policeAssessment === 'Eligible for Bail' ? 'eligible' : 'pending'}`}>{caseInfo.policeAssessment}</span>
          </div>
        </div>
        <div className="case-meta">
          <span><strong>Case ID:</strong> {caseInfo.caseId}</span>
          <span><strong>Court:</strong> {caseInfo.court}</span>
          <span><strong>FIR:</strong> {caseInfo.FIRNumber}</span>
          <span><strong>Next Hearing:</strong> {new Date(caseInfo.nextHearing).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content card">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overview-tab">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Case Summary</h3>
              {caseInfo.analysisCompleted && analysis?.final_report && (
                <button className="btn btn-primary" onClick={handleDownloadReport}>
                  Download Legal Report
                </button>
              )}
            </div>
            <p className="summary-text">{caseInfo.summary}</p>
            
            <div className="details-grid">
              <div className="detail-item">
                <label>Age / Gender</label>
                <p>{caseInfo.age} / {caseInfo.gender}</p>
              </div>
              <div className="detail-item">
                <label>District</label>
                <p>{caseInfo.district}</p>
              </div>
              <div className="detail-item">
                <label>Charges</label>
                <p>{caseInfo.charges}</p>
              </div>
              <div className="detail-item">
                <label>Detention Start</label>
                <p>{new Date(caseInfo.detentionStartDate).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Surety Amount</label>
                <p>₹{caseInfo.suretyAmount.toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Family Contact</label>
                <p>{caseInfo.familyContact}</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="timeline-tab">
            <h3>Case Lifecycle Progress</h3>
            <div className="vertical-timeline">
              
              <div className="timeline-node completed">
                <div className="node-icon"><CheckCircle size={16} /></div>
                <div className="node-content">
                  <h4>Case Registered</h4>
                  <p>Initial FIR and details ingested into JusticeGrid.</p>
                  <span className="node-date">{new Date(caseInfo.detentionStartDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="timeline-line completed"></div>

              <div className="timeline-node completed">
                <div className="node-icon"><CheckCircle size={16} /></div>
                <div className="node-content">
                  <h4>Documents Uploaded</h4>
                  <p>{data.documents.length} legal documents attached to case file.</p>
                </div>
              </div>

              <div className={`timeline-line ${caseInfo.analysisCompleted ? 'completed' : 'active'}`}></div>

              <div className={`timeline-node ${caseInfo.analysisCompleted ? 'completed' : (showCourtroom ? 'active' : 'pending')}`}>
                <div className="node-icon">{caseInfo.analysisCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}</div>
                <div className="node-content">
                  <h4>AI Multi-Agent Review</h4>
                  {caseInfo.analysisCompleted ? (
                    <p>Intake, Eligibility, Strategy, and Financial agents concluded analysis.</p>
                  ) : showCourtroom ? (
                    <p>Live session in progress. Agents deliberating...</p>
                  ) : (
                    <p>Waiting for Lawyer to initiate AI review.</p>
                  )}
                </div>
              </div>

              <div className={`timeline-line ${caseInfo.analysisCompleted ? 'completed' : 'pending'}`}></div>

              <div className={`timeline-node ${analysis?.final_report ? 'completed' : 'pending'}`}>
                <div className="node-icon">{analysis?.final_report ? <CheckCircle size={16} /> : <Clock size={16} />}</div>
                <div className="node-content">
                  <h4>Judge Node Decision</h4>
                  <p>{analysis?.final_report ? 'Deterministic ruling applied.' : 'Pending AI Review completion.'}</p>
                </div>
              </div>

              <div className={`timeline-line ${analysis?.final_report ? 'completed' : 'pending'}`}></div>

              <div className={`timeline-node ${analysis?.final_report ? 'completed' : 'pending'}`}>
                <div className="node-icon">{analysis?.final_report ? <CheckCircle size={16} /> : <Clock size={16} />}</div>
                <div className="node-content">
                  <h4>Official Report Generated</h4>
                  <p>{analysis?.final_report ? 'PDF ready for download and distribution.' : 'Pending.'}</p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="documents-tab">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Case Documents</h3>
              {userData?.role === 'family' ? (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload} 
                    accept="image/*,.pdf"
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Analyzing AI...' : 'Upload New Document'}
                  </button>
                </>
              ) : (
                <button className="btn btn-outline">Request Document</button>
              )}
            </div>

            <div className="documents-grid">
              {data.documents.map(doc => (
                <div key={doc.id} className="document-card" style={{ border: doc.approved === false ? '2px solid var(--status-pending)' : 'none' }}>
                  <FileIcon size={32} className="doc-icon" />
                  <div className="doc-info" style={{ flex: 1 }}>
                    <h4>{doc.documentType || doc.documentName}</h4>
                    <p>{doc.summary || doc.documentName}</p>
                    <span className="doc-date">Uploaded: {new Date(doc.uploadedDate || doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    {doc.approved === false ? (
                      <span className="badge badge-pending">Pending Approval</span>
                    ) : (
                      <span className="badge badge-eligible">Approved</span>
                    )}
                    {userData?.role === 'lawyer' && doc.approved === false && (
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          import('../../services/caseService').then(({ approveDocument }) => {
                            approveDocument(doc.id).then(() => {
                              alert("Document approved!");
                            });
                          });
                        }}
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {data.documents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No documents have been uploaded to this case yet.
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ai-tab">
            {!analysis && !showCourtroom && !data.caseInfo.analysisCompleted ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <BrainCircuit size={48} color="var(--accent-brown)" style={{ marginBottom: '1rem' }} />
                <h3>AI Analysis Pending</h3>
                
                {userData?.role === 'family' ? (
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    No AI review has been initiated by the assigned lawyer.
                  </p>
                ) : (
                  <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                      Initiate a multi-agent AI review to assess bail eligibility and case strategy.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowCourtroom(true)}
                    >
                      Start AI Review
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {showCourtroom && (
              <Courtroom 
                caseId={id} 
                onAnalysisComplete={async () => {
                  const latest = await getCaseAnalysis(id);
                  setData(prev => ({...prev, analysis: latest}));
                  setShowCourtroom(false);
                }} 
              />
            )}
            
            {analysis && !showCourtroom && (
              <div className="final-verdict-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--accent-brown)' }}>Final Judgment</h2>
                    <button className="btn btn-outline" onClick={() => setShowWhy(!showWhy)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
                      {showWhy ? 'Hide Breakdown' : 'Why?'}
                    </button>
                  </div>
                  <button className="btn btn-primary" onClick={handleDownloadReport}>Download Legal Report</button>
                </div>

                <AnimatePresence>
                  {showWhy && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="why-breakdown-card card"
                      style={{ marginBottom: '1.5rem', background: '#f8fafc', borderLeft: '4px solid #3b82f6', overflow: 'hidden' }}
                    >
                      <h3 style={{ marginTop: 0, color: '#1e293b' }}>Decision Breakdown</h3>
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem', color: '#475569' }}>Reasons:</h4>
                        <ul style={{ paddingLeft: '1.5rem', color: '#334155', lineHeight: '1.6' }}>
                          {analysis.merged_data?.eligibility?.result?.reasoning && (
                            <li><strong>Statutory Threshold:</strong> {analysis.merged_data.eligibility.result.reasoning}</li>
                          )}
                          {analysis.merged_data?.delay?.result?.reasoning && (
                            <li><strong>Delay Analysis:</strong> {analysis.merged_data.delay.result.reasoning}</li>
                          )}
                          {analysis.merged_data?.financial?.result?.reasoning && (
                            <li><strong>Financial Status:</strong> {analysis.merged_data.financial.result.reasoning}</li>
                          )}
                          <li><strong>Overall Logic:</strong> {analysis.final_report?.result?.reasoning}</li>
                        </ul>
                      </div>

                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem', color: '#475569' }}>Agents that supported the decision:</h4>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {['eligibility', 'delay', 'financial', 'strategy'].map(agent => (
                            <div key={agent} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                              <CheckCircle size={14} color="#10b981" />
                              <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>{agent} Agent</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ marginBottom: '0.5rem', color: '#475569' }}>Legal Sections Used:</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {(analysis.final_report?.result?.legal_references || "Section 479 BNSS, Article 21 Constitution").split(/[,;]/).map((ref, idx) => (
                            <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>
                              {ref.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="verdict-summary card" style={{ background: '#fef3c7', borderColor: '#d97706', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: '#92400e' }}>Decision: {analysis.final_report?.result?.recommendation || 'Pending'}</h3>
                    <span className="badge badge-eligible">{analysis.final_report?.metadata?.confidence || '100'}% Confidence</span>
                  </div>
                  <p style={{ margin: 0, color: '#92400e', lineHeight: 1.5 }}>{analysis.final_report?.result?.reasoning}</p>
                </div>

                <div className="details-grid">
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <label>Days Served</label>
                    <p>{analysis.merged_data?.eligibility?.result?.finding || 'Calculated deterministically'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Applicable Law</label>
                    <p>Section 436A, CrPC</p>
                  </div>
                  <div className="detail-item">
                    <label>Surety Recommendation</label>
                    <p>{analysis.merged_data?.financial?.result?.recommendation || 'Standard Surety'}</p>
                  </div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <label>Delay Analysis</label>
                    <p>{analysis.merged_data?.delay?.result?.finding || 'Procedural delay attributable to prosecution.'}</p>
                  </div>
                  <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                    <label>Strategy Summary</label>
                    <p>{analysis.merged_data?.strategy?.result?.finding || 'Apply for immediate bail.'}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}


      </div>
    </motion.div>
  );
};

export default CaseDetails;
