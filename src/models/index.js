const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ─────────────── ADMIN ─────────────── */
const AdminSchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, select: false },
  role:      { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  lastLogin: { type: Date },
}, { timestamps: true });

/* ─────────────── CONTACT ─────────────── */
const ContactSchema = new Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String },
  message:   { type: String, required: true },
  status:    { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  adminReply:{ type: String },
  repliedAt: { type: Date },
  ipAddress: { type: String },
}, { timestamps: true });

/* ─────────────── BOOKING ─────────────── */
const BookingSchema = new Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String },
  service:     { type: String, required: true },
  plan:        { type: String },
  message:     { type: String },
  budget:      { type: String },
  timeline:    { type: String },
  status:      { type: String, enum: ['pending', 'approved', 'rejected', 'replied'], default: 'pending' },
  adminReply:  { type: String },
  repliedAt:   { type: Date },
  ipAddress:   { type: String },
}, { timestamps: true });

/* ─────────────── SERVICE ─────────────── */
const ServiceSchema = new Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String },
  icon:        { type: String },
  features:    [{ type: String }],
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── PROJECT ─────────────── */
const ProjectSchema = new Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  category:    { type: String, required: true },
  description: { type: String },
  thumbnail:   { type: String },
  images:      [{ type: String }],
  tags:        [{ type: String }],
  clientName:  { type: String },
  liveUrl:     { type: String },
  isFeatured:  { type: Boolean, default: false },
  isSelected:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── TESTIMONIAL ─────────────── */
const TestimonialSchema = new Schema({
  name:        { type: String, required: true },
  role:        { type: String },
  company:     { type: String },
  review:      { type: String, required: true },
  rating:      { type: Number, min: 1, max: 5, default: 5 },
  avatar:      { type: String },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── PRICING PLAN ─────────────── */
const PricingPlanSchema = new Schema({
  name:        { type: String, required: true },
  billingCycle:{ type: String, enum: ['monthly', 'yearly'], required: true },
  price:       { type: String, required: true },
  period:      { type: String },
  description: { type: String },
  features:    [{ type: String }],
  isPopular:   { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── TEAM MEMBER ─────────────── */
const TeamMemberSchema = new Schema({
  name:        { type: String, required: true },
  role:        { type: String, required: true },
  bio:         { type: String },
  photo:       { type: String },
  connectUrl:  { type: String },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── REEL ─────────────── */
const ReelSchema = new Schema({
  title:       { type: String },
  videoUrl:    { type: String, required: true },
  thumbnail:   { type: String },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── CREATIVE WORK ─────────────── */
/* NEW: "Creative Works" portfolio items (images, posters, design samples) */
const CreativeWorkSchema = new Schema({
  title:       { type: String, required: true },
  category:    { type: String, required: true },   // e.g. 'poster', 'logo', 'social', 'branding'
  description: { type: String },
  imageUrl:    { type: String, required: true },   // main display image / URL
  tags:        [{ type: String }],
  clientName:  { type: String },
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────── MEDIA ─────────────── */
const MediaSchema = new Schema({
  filename:    { type: String, required: true },
  originalName:{ type: String },
  url:         { type: String, required: true },
  mimetype:    { type: String },
  size:        { type: Number },
  folder:      { type: String, default: 'general' },
  uploadedBy:  { type: Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

/* ─────────────── SETTINGS ─────────────── */
const SettingsSchema = new Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
  group: { type: String, default: 'general' },
}, { timestamps: true });

/* ─────────────── SEO ─────────────── */
const SeoSchema = new Schema({
  page:        { type: String, required: true, unique: true },
  title:       { type: String },
  description: { type: String },
  keywords:    [{ type: String }],
  ogImage:     { type: String },
  canonical:   { type: String },
}, { timestamps: true });

module.exports = {
  Admin:        mongoose.model('Admin', AdminSchema),
  Contact:      mongoose.model('Contact', ContactSchema),
  Booking:      mongoose.model('Booking', BookingSchema),
  Service:      mongoose.model('Service', ServiceSchema),
  Project:      mongoose.model('Project', ProjectSchema),
  Testimonial:  mongoose.model('Testimonial', TestimonialSchema),
  PricingPlan:  mongoose.model('PricingPlan', PricingPlanSchema),
  TeamMember:   mongoose.model('TeamMember', TeamMemberSchema),
  Reel:         mongoose.model('Reel', ReelSchema),
  CreativeWork: mongoose.model('CreativeWork', CreativeWorkSchema),
  Media:        mongoose.model('Media', MediaSchema),
  Settings:     mongoose.model('Settings', SettingsSchema),
  Seo:          mongoose.model('Seo', SeoSchema),
};
