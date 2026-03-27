import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const TaxRuleSchema = new mongoose.Schema({
  taxType: String,
  category: String,
  assessmentYear: String,
  slabs: Array,
  surcharge: Object,
  cess: Object,
  rebate: Object,
  isActive: Boolean,
  effectiveFrom: Date,
  effectiveTo: Date,
});

const TaxRule = mongoose.model('TaxRule', TaxRuleSchema);

const seedTaxRules = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing rules
    await TaxRule.deleteMany({});

    // Income Tax Rules (Old Regime)
    const incomeTaxOld = {
      taxType: 'income_tax',
      category: 'individual_old',
      assessmentYear: '2025-2026',
      slabs: [
        { minIncome: 0, maxIncome: 250000, rate: 0 },
        { minIncome: 250000, maxIncome: 500000, rate: 5 },
        { minIncome: 500000, maxIncome: 1000000, rate: 20 },
        { minIncome: 1000000, maxIncome: Infinity, rate: 30 },
      ],
      surcharge: {
        applicable: true,
        slabs: [
          { minIncome: 5000000, maxIncome: 10000000, rate: 10 },
          { minIncome: 10000000, maxIncome: 20000000, rate: 15 },
          { minIncome: 20000000, maxIncome: 50000000, rate: 25 },
          { minIncome: 50000000, maxIncome: Infinity, rate: 37 },
        ],
      },
      cess: {
        applicable: true,
        rate: 4, // 4% Health & Education Cess
      },
      rebate: {
        maxIncome: 500000,
        amount: 12500,
      },
      isActive: true,
      effectiveFrom: new Date('2025-04-01'),
    };

    // Income Tax Rules (New Regime)
    const incomeTaxNew = {
      taxType: 'income_tax',
      category: 'individual_new',
      assessmentYear: '2025-2026',
      slabs: [
        { minIncome: 0, maxIncome: 300000, rate: 0 },
        { minIncome: 300000, maxIncome: 600000, rate: 5 },
        { minIncome: 600000, maxIncome: 900000, rate: 10 },
        { minIncome: 900000, maxIncome: 1200000, rate: 15 },
        { minIncome: 1200000, maxIncome: 1500000, rate: 20 },
        { minIncome: 1500000, maxIncome: Infinity, rate: 30 },
      ],
      surcharge: {
        applicable: true,
        slabs: [
          { minIncome: 5000000, maxIncome: 10000000, rate: 10 },
          { minIncome: 10000000, maxIncome: 20000000, rate: 15 },
          { minIncome: 20000000, maxIncome: 50000000, rate: 25 },
          { minIncome: 50000000, maxIncome: Infinity, rate: 37 },
        ],
      },
      cess: {
        applicable: true,
        rate: 4,
      },
      rebate: {
        maxIncome: 700000,
        amount: 25000,
      },
      isActive: true,
      effectiveFrom: new Date('2025-04-01'),
    };

    await TaxRule.insertMany([incomeTaxOld, incomeTaxNew]);

    console.log('✅ Tax rules seeded successfully!');
    console.log('\nSeeded Rules:');
    console.log('1. Income Tax (Old Regime) - individual_old');
    console.log('2. Income Tax (New Regime) - individual_new');
    console.log('\nNow you can calculate taxes in your application!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

seedTaxRules();
