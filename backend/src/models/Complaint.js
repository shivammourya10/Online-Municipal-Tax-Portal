import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complainant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  complaintNumber: {
    type: String,
    unique: true,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'water_supply',
      'garbage_collection',
      'street_light',
      'road_repair',
      'drainage',
      'sewerage',
      'encroachment',
      'noise_pollution',
      'illegal_construction',
      'property_tax',
      'public_toilet',
      'park_maintenance',
      'stray_animals',
      'other'
    ],
    required: true,
  },
  subCategory: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  details: {
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: String,
      landmark: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      ward: String,
      zone: String,
    },
  },
  attachments: [{
    type: {
      type: String,
      enum: ['photo', 'video', 'document'],
    },
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  contactDetails: {
    phone: String,
    email: String,
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'both'],
      default: 'both',
    },
  },
  assignedTo: {
    department: {
      type: String,
      enum: [
        'water_supply',
        'sanitation',
        'electricity',
        'roads',
        'parks',
        'tax',
        'health',
        'engineering',
        'administration'
      ],
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedDate: Date,
  },
  resolution: {
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
      default: 'open',
    },
    resolvedDate: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionRemarks: String,
    resolutionPhotos: [{
      url: String,
      publicId: String,
    }],
    actionTaken: String,
    timeTaken: Number, // in hours
  },
  timeline: [{
    action: {
      type: String,
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    byName: String,
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: String,
    status: String,
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: String,
    submittedAt: Date,
  },
  slaDeadline: Date, // Service Level Agreement deadline
  isEscalated: {
    type: Boolean,
    default: false,
  },
  escalatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  escalatedAt: Date,
}, {
  timestamps: true,
});

// Indexes
complaintSchema.index({ complaintNumber: 1 });
complaintSchema.index({ complainant: 1, createdAt: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ 'resolution.status': 1 });
complaintSchema.index({ 'assignedTo.department': 1 });
complaintSchema.index({ priority: 1 });

// Generate complaint number before saving
complaintSchema.pre('save', async function(next) {
  if (!this.complaintNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintNumber = `CMP/${year}/${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate SLA deadline based on priority
  if (!this.slaDeadline && this.isNew) {
    const now = new Date();
    switch (this.priority) {
      case 'urgent':
        this.slaDeadline = new Date(now.setHours(now.getHours() + 24)); // 24 hours
        break;
      case 'high':
        this.slaDeadline = new Date(now.setDate(now.getDate() + 3)); // 3 days
        break;
      case 'medium':
        this.slaDeadline = new Date(now.setDate(now.getDate() + 7)); // 7 days
        break;
      case 'low':
        this.slaDeadline = new Date(now.setDate(now.getDate() + 15)); // 15 days
        break;
    }
  }
  
  next();
});

// Add to timeline when status changes
complaintSchema.methods.addToTimeline = function(action, by, remarks, status) {
  this.timeline.push({
    action,
    by,
    byName: by?.profile?.firstName + ' ' + by?.profile?.lastName,
    remarks,
    status: status || this.resolution.status,
  });
};

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
