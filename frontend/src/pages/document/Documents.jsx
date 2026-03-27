import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { uploadDocument, getDocuments, deleteDocument } from '../../features/document/documentSlice';
import LoadingSpinner from '../../components/LoadingSpinner';

const Documents = () => {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state) => state.document);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadData, setUploadData] = useState({
    type: 'pan_card',
    title: '',
    description: '',
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('Documents page mounted, fetching documents...');
    dispatch(getDocuments()).then((result) => {
      console.log('Documents fetch result:', result);
    }).catch((error) => {
      console.error('Documents fetch error:', error);
      toast.error('Failed to load documents');
    });
  }, [dispatch]);

  const documentTypes = [
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'aadhaar_card', label: 'Aadhaar Card' },
    { value: 'form16', label: 'Form 16' },
    { value: 'form16a', label: 'Form 16A' },
    { value: 'itr', label: 'ITR' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'investment_proof', label: 'Investment Proof' },
    { value: 'property_document', label: 'Property Document' },
    { value: 'expense_receipt', label: 'Expense Receipt' },
    { value: 'gst_certificate', label: 'GST Certificate' },
    { value: 'business_registration', label: 'Business Registration' },
    { value: 'other', label: 'Other' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file) => {
    // Validate file type - only PDF and JPG
    const allowedTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG and PDF files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!uploadData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', uploadData.type);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);

    try {
      console.log('Uploading document...', { type: uploadData.type, title: uploadData.title });
      const result = await dispatch(uploadDocument(formData)).unwrap();
      console.log('Upload success:', result);
      
      if (!result) {
        throw new Error('Upload succeeded but no document data returned');
      }
      
      toast.success('Document uploaded successfully');
      
      // Reset form
      setSelectedFile(null);
      setUploadData({ type: 'pan_card', title: '', description: '' });
      
      // Refresh documents list
      dispatch(getDocuments());
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = typeof error === 'string' ? error : 
                       error?.message || 
                       error?.response?.data?.message || 
                       'Failed to upload document';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await dispatch(deleteDocument(documentId)).unwrap();
        toast.success('Document deleted successfully');
        dispatch(getDocuments());
      } catch (error) {
        toast.error(error.message || 'Failed to delete document');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const filteredDocuments = documents && Array.isArray(documents) 
    ? (filter === 'all' 
      ? documents 
      : documents.filter(doc => doc.verification?.status === filter))
    : [];

  if (loading && documents.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Upload Document</h2>
        
        <form onSubmit={handleUpload} className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".jpg,.jpeg,.pdf"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">📁</div>
                <p className="text-gray-600">
                  Drag and drop your file here, or{' '}
                  <label htmlFor="file-upload" className="text-primary-600 cursor-pointer hover:underline">
                    browse
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PDF (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Document Type *</label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                className="input"
                required
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                className="input"
                placeholder="e.g., PAN Card 2024"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="input"
              rows="3"
              placeholder="Add any additional details about this document"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !selectedFile}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Documents</h2>
          
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Documents</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-500">No documents found</p>
            <p className="text-sm text-gray-400 mt-2">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Document</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Uploaded</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        {doc.description && (
                          <p className="text-sm text-gray-500">{doc.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {documentTypes.find(t => t.value === doc.type)?.label || doc.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.verification.status)}`}>
                        {doc.verification.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <a
                        href={doc.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
