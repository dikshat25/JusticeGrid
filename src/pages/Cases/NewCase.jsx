import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createCase } from '../../services/caseService';
import { UploadCloud, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const NewCase = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    undertrialName: '',
    age: '',
    gender: 'Male',
    court: '',
    judge: '',
    policeStation: '',
    district: '',
    charges: '',
    FIRNumber: '',
    detentionStartDate: '',
    suretyAmount: '',
    priority: 'Medium',
    familyEmail: ''
  });

  const [ocrLoading, setOcrLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOcrLoading(true);
      toast.loading("Extracting FIR data via OCR...", { id: "ocr" });
      
      // Simulate OCR delay
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          undertrialName: 'Rajesh Kumar',
          age: '32',
          gender: 'Male',
          court: 'District Sessions Court, Pune',
          judge: 'Hon. Justice M. Sharma',
          policeStation: 'Shivajinagar Police Station',
          district: 'Pune',
          charges: 'IPC Sec 420, 406 (Cheating and Criminal Breach of Trust)',
          FIRNumber: 'CR-2023/0441',
          detentionStartDate: '2023-01-15',
          suretyAmount: '50000',
          priority: 'High'
        }));
        
        setOcrLoading(false);
        toast.success("FIR Data successfully extracted!", { id: "ocr" });
      }, 2500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Assemble case payload
      const casePayload = {
        ...formData,
        lawyerId: currentUser.uid,
        lawyerName: userData.name,
        status: 'Active',
        analysisCompleted: false,
        summary: `Undertrial ${formData.undertrialName} detained since ${formData.detentionStartDate} under charges of ${formData.charges}.`,
        policeAssessment: 'Pending Review',
        nextHearing: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() // Mock 14 days from now
      };

      const newCaseId = await createCase(casePayload);
      toast.success("Case created successfully!");
      navigate(`/dashboard/cases/${newCaseId}`);
    } catch (error) {
      toast.error(error.message || "Failed to create case.");
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cases-page">
      <button className="btn-link" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="dashboard-header">
        <h1>Create New Case</h1>
        <p>Upload an FIR for automatic extraction or fill the details manually.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Left Col: Upload */}
        <div className="card" style={{ flex: '1', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: '12px', 
            padding: '3rem 2rem',
            background: 'var(--bg-cream)',
            position: 'relative'
          }}>
            {ocrLoading ? (
              <div className="loading-spinner" style={{ margin: 'auto' }}></div>
            ) : (
              <>
                <UploadCloud size={48} color="var(--accent-brown)" style={{ marginBottom: '1rem' }} />
                <h3>Upload FIR Document</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  Upload a scanned PDF. Our AI will automatically extract all relevant case metadata.
                </p>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg" 
                  id="fir-upload" 
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <label htmlFor="fir-upload" className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-block' }}>
                  Browse Files
                </label>
              </>
            )}
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>AI Extraction Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: formData.FIRNumber ? '#10b981' : 'var(--text-muted)' }}>
              {formData.FIRNumber ? <CheckCircle size={16} /> : <FileText size={16} />}
              <span>{formData.FIRNumber ? 'FIR Data Extracted' : 'Waiting for upload...'}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="card" style={{ flex: '2' }}>
          <form onSubmit={handleSubmit}>
            
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Undertrial & Case Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Undertrial Name</label>
                <input type="text" className="input-field" name="undertrialName" value={formData.undertrialName} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">FIR Number</label>
                <input type="text" className="input-field" name="FIRNumber" value={formData.FIRNumber} onChange={handleInputChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Age</label>
                <input type="number" className="input-field" name="age" value={formData.age} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">Gender</label>
                <select className="input-field" name="gender" value={formData.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Detention Start</label>
                <input type="date" className="input-field" name="detentionStartDate" value={formData.detentionStartDate} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label">Charges / IPC Sections</label>
              <textarea className="input-field" name="charges" value={formData.charges} onChange={handleInputChange} required rows="2"></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Court</label>
                <input type="text" className="input-field" name="court" value={formData.court} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">Judge</label>
                <input type="text" className="input-field" name="judge" value={formData.judge} onChange={handleInputChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Police Station</label>
                <input type="text" className="input-field" name="policeStation" value={formData.policeStation} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">District</label>
                <input type="text" className="input-field" name="district" value={formData.district} onChange={handleInputChange} required />
              </div>
              <div className="input-group">
                <label className="input-label">Priority</label>
                <select className="input-field" name="priority" value={formData.priority} onChange={handleInputChange}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Family Linking
            </h3>

            <div className="input-group" style={{ marginBottom: '2rem' }}>
              <label className="input-label">Family Member Email</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                If the family member registers with this email, they will automatically be linked to this case.
              </p>
              <input type="email" className="input-field" name="familyEmail" value={formData.familyEmail} onChange={handleInputChange} placeholder="family@example.com" required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || ocrLoading}>
                {isSubmitting ? 'Creating Case...' : 'Create Case File'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default NewCase;
