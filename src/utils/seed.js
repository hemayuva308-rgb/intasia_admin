require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt    = require('bcryptjs');
const connectDB = require('../config/db');
const { Admin, Service, PricingPlan, TeamMember, Testimonial } = require('../models');

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database…');

  // ── Admin ────────────────────────────────────────────────────────────────────
  // FIX: email matches ADMIN_EMAIL in .env; password is secure
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@intasia.in';
  const existing = await Admin.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash('Intasia@Admin2026', 12);
    await Admin.create({
      name:     'Intasia Admin',
      email:    adminEmail,
      password: hashed,
      role:     'superadmin',
    });
    console.log(`✅ Admin created — email: ${adminEmail}  password: Intasia@Admin2026`);
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
  }

  // ── Services ─────────────────────────────────────────────────────────────────
  // FIX: All 14 services the frontend references, with slugs that match
  //      the *-projects.html filenames (e.g. seo-projects.html → slug: 'seo-aeo-geo')
  await Service.deleteMany({});
  await Service.insertMany([
    {
      title:       'SEO • AEO • GEO',
      slug:        'seo-aeo-geo',              // → seo-projects.html
      description: 'Dominate Search. Own Visibility. Drive Revenue. Get your brand discovered across Google, ChatGPT, Gemini, and emerging AI search platforms.',
      icon:        '🔍',
      order:       1,
      features:    ['Technical SEO Audit', 'AI-driven Content Strategy', 'GEO Targeting', 'AEO Schema Markup', 'Search Rank Tracking'],
    },
    {
      title:       'AI Automations',
      slug:        'ai-automation',            // → ai-automation-projects.html
      description: 'Work Less. Scale Faster. Replace repetitive tasks with intelligent automation systems that capture leads, nurture prospects, and save hundreds of hours every year.',
      icon:        '🤖',
      order:       2,
      features:    ['Custom AI Agents', 'CRM Automation', 'Lead Nurturing Flows', 'Data Pipeline Builds', 'Chatbot Integration'],
    },
    {
      title:       'Digital Marketing',
      slug:        'digital-marketing',        // → digital-marketing-projects.html
      description: 'Turn Attention Into Customers. Build predictable growth with data-driven marketing strategies designed to increase reach, generate leads, and improve conversions.',
      icon:        '📈',
      order:       3,
      features:    ['Paid Media (Meta / Google)', 'Influencer Sourcing', 'Analytics Dashboards', 'Conversion Rate Optimisation', 'Retargeting Campaigns'],
    },
    {
      title:       'Content Optimization',
      slug:        'content-optimization',     // → content-optimization-projects.html
      description: 'Make Every Piece of Content Work Harder. Transform existing content into powerful growth assets that attract more traffic, engagement, and conversions.',
      icon:        '✍️',
      order:       4,
      features:    ['Content Audit & Gap Analysis', 'SEO Copywriting', 'Blog & Article Rewriting', 'CRO-focused Edits', 'Content Calendar'],
    },
    {
      title:       'Brand Growth Strategy',
      slug:        'brand-strategy',           // → brand-strategy-projects.html
      description: 'Build a Brand That Lasts. Develop a comprehensive strategy that positions your brand for long-term growth and market dominance.',
      icon:        '🚀',
      order:       5,
      features:    ['Market Research', 'Competitor Analysis', 'Brand Positioning', 'Go-to-Market Strategy', 'OKR Roadmapping'],
    },
    {
      title:       'Brand Storytelling',
      slug:        'brand-storytelling',       // → brand-storytelling-projects.html
      description: 'Tell Stories That Sell. Craft compelling brand narratives that connect emotionally with your audience and build lasting loyalty.',
      icon:        '📖',
      order:       6,
      features:    ['Brand Voice & Tone Guide', 'Origin Story Crafting', 'Video Scriptwriting', 'Case Study Writing', 'Social Narratives'],
    },
    {
      title:       'Social Media Marketing',
      slug:        'social-media',             // → social-media-projects.html
      description: 'Own Your Feed. Build a dominant social media presence that attracts followers, drives engagement, and converts them into customers.',
      icon:        '📱',
      order:       7,
      features:    ['Platform Strategy (IG / LinkedIn / X)', 'Content Creation', 'Community Management', 'Hashtag Strategy', 'Monthly Analytics Report'],
    },
    {
      title:       'Video Editing',
      slug:        'video-editing',            // → video-editing-projects.html
      description: 'Cinematic Content That Stops the Scroll. Professional video editing for brands that want to stand out across every platform.',
      icon:        '🎬',
      order:       8,
      features:    ['Reels & Short-form', 'Brand Films', 'Motion Graphics', 'Colour Grading', 'Subtitles & Captions'],
    },
    {
      title:       'Logo & Poster Design',
      slug:        'design',                   // → design-projects.html
      description: 'Design That Commands Attention. Stunning logos, posters, and visual assets that communicate your brand at a glance.',
      icon:        '🎨',
      order:       9,
      features:    ['Logo Design (3 concepts)', 'Brand Style Guide', 'Poster & Banner Design', 'Social Media Templates', 'Print-ready Files'],
    },
    {
      title:       'Email Marketing',
      slug:        'email-marketing',          // → email-marketing-projects.html
      description: 'Emails People Actually Open. Build automated email sequences that nurture leads, retain customers, and drive revenue on autopilot.',
      icon:        '📧',
      order:       10,
      features:    ['Campaign Strategy', 'Copywriting & Design', 'List Segmentation', 'A/B Testing', 'Performance Reporting'],
    },
    {
      title:       'Portfolio Website',
      slug:        'portfolio-website',        // → portfolio-website-projects.html
      description: 'Your Work Deserves a Stage. Beautiful, fast portfolio websites that showcase your talent and win clients.',
      icon:        '🖼️',
      order:       11,
      features:    ['Custom Design', 'Mobile Responsive', 'CMS Integration', 'Contact Form', 'SEO Optimised'],
    },
    {
      title:       'Premium Website',
      slug:        'premium-website',          // → premium-website-projects.html
      description: 'Bespoke, High-Performance Digital Experiences. Enterprise-grade websites built for speed, conversions, and brand impact.',
      icon:        '💻',
      order:       12,
      features:    ['Custom Design System', 'React / Next.js Build', 'CMS Integration', 'Performance Optimisation', 'Ongoing Support'],
    },
    {
      title:       'E-Commerce Website',
      slug:        'ecommerce',                // → ecommerce-projects.html
      description: 'Sell More, Every Day. Fully featured e-commerce stores built to convert browsers into buyers and scale with your business.',
      icon:        '🛒',
      order:       13,
      features:    ['Product Catalogue Setup', 'Payment Gateway Integration', 'Inventory Management', 'Mobile-first Design', 'Order Tracking'],
    },
    {
      title:       'Collaborative Calls',
      slug:        'consulting',               // → consulting-projects.html
      description: 'Strategy Sessions That Move the Needle. One-on-one consulting calls with our experts to audit, plan, and accelerate your growth.',
      icon:        '🤝',
      order:       14,
      features:    ['Free 30-min Discovery Call', 'Deep-dive Strategy Session', 'Actionable Roadmap', 'Recorded Session', 'Follow-up Support'],
    },
  ]);
  console.log('✅ Services seeded (14 services)');

  // ── Pricing Plans ─────────────────────────────────────────────────────────────
  await PricingPlan.deleteMany({});
  await PricingPlan.insertMany([
    // Monthly
    {
      name: 'Starter', billingCycle: 'monthly', price: '₹15,000', period: '/month',
      description: 'Perfect for early-stage brands.',
      features: ['1 Service Channel', 'Monthly Reports', 'Email Support', '2 Revision Rounds'],
      order: 1,
    },
    {
      name: 'Growth', billingCycle: 'monthly', price: '₹35,000', period: '/month',
      description: 'Scale with speed.',
      features: ['3 Service Channels', 'Bi-weekly Reports', 'Priority Support', '5 Revision Rounds', 'Dedicated Account Manager'],
      isPopular: true, order: 2,
    },
    {
      name: 'Elite', billingCycle: 'monthly', price: '₹75,000', period: '/month',
      description: 'Full-stack digital domination.',
      features: ['All Services', 'Weekly Reports', '24/7 Support', 'Unlimited Revisions', 'Quarterly Strategy Sessions', 'Custom AI Tools'],
      order: 3,
    },
    // Yearly (20% discount)
    {
      name: 'Starter Yearly', billingCycle: 'yearly', price: '₹1,44,000', period: '/year',
      description: 'Starter plan, billed yearly — save 20%.',
      features: ['1 Service Channel', 'Monthly Reports', 'Email Support', '2 Revision Rounds'],
      order: 1,
    },
    {
      name: 'Growth Yearly', billingCycle: 'yearly', price: '₹3,36,000', period: '/year',
      description: 'Growth plan, billed yearly — save 20%.',
      features: ['3 Service Channels', 'Bi-weekly Reports', 'Priority Support', '5 Revision Rounds', 'Dedicated Account Manager'],
      isPopular: true, order: 2,
    },
    {
      name: 'Elite Yearly', billingCycle: 'yearly', price: '₹7,20,000', period: '/year',
      description: 'Elite plan, billed yearly — save 20%.',
      features: ['All Services', 'Weekly Reports', '24/7 Support', 'Unlimited Revisions', 'Quarterly Strategy Sessions', 'Custom AI Tools'],
      order: 3,
    },
  ]);
  console.log('✅ Pricing plans seeded');

  // ── Team Members ──────────────────────────────────────────────────────────────
  await TeamMember.deleteMany({});
  await TeamMember.insertMany([
    { name: 'Aryan Mehta',   role: 'Founder & Creative Director',  bio: "Visionary behind Intasia's design philosophy.", order: 1 },
    { name: 'Priya Sharma',  role: 'Head of Digital Strategy',     bio: 'Data-driven strategist with 8+ years in growth marketing.', order: 2 },
    { name: 'Rohan Iyer',    role: 'Lead Developer',               bio: 'Full-stack engineer specialising in high-performance web.', order: 3 },
    { name: 'Sneha Kapoor',  role: 'AI & Automation Lead',         bio: 'Building intelligent systems that scale brands.', order: 4 },
  ]);
  console.log('✅ Team members seeded');

  // ── Testimonials ──────────────────────────────────────────────────────────────
  await Testimonial.deleteMany({});
  await Testimonial.insertMany([
    { name: 'Ananya Krishnan', role: 'CEO',           company: 'NovaBrand',  review: 'Intasia transformed our online presence completely. The ROI speaks for itself.',                              rating: 5, order: 1 },
    { name: 'Vikram Nair',     role: 'Founder',       company: 'TechPulse',  review: 'Their AI automation solutions cut our lead response time by 80%. Incredible team.',                          rating: 5, order: 2 },
    { name: 'Meera Joshi',     role: 'Marketing Head', company: 'LuxeStyle', review: 'Stunning website and killer SEO results within 3 months. Highly recommended.',                              rating: 5, order: 3 },
  ]);
  console.log('✅ Testimonials seeded');

  console.log('\n🎉 Seed complete!');
  console.log('   Admin login → email: admin@intasia.in  |  password: Intasia@Admin2026');
  console.log('   Start server: npm run dev\n');
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
