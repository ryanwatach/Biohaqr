import { configDotenv } from "dotenv";
import path from "node:path";

configDotenv({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient, CompoundCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const compounds = [
  {
    name: "Magnesium Glycinate",
    category: CompoundCategory.supplement,
    mechanismSummary:
      "Modulates GABA-A receptor activity and reduces NMDA-mediated excitation, improving sleep onset latency and depth.",
    citations: [
      {
        text: "Abbasi B et al. (2012) The effect of magnesium supplementation on primary insomnia in elderly: A double-blind placebo-controlled clinical trial. J Res Med Sci.",
        url: "https://pubmed.ncbi.nlm.nih.gov/23853635/",
      },
    ],
  },
  {
    name: "Ashwagandha (KSM-66)",
    category: CompoundCategory.supplement,
    mechanismSummary:
      "HPA-axis modulation via withanolide glycosides; reduces serum cortisol and perceived stress scores in randomised trials.",
    citations: [
      {
        text: "Chandrasekhar K et al. (2012) A prospective, randomized double-blind, placebo-controlled study of safety and efficacy of a high-concentration full-spectrum extract of Ashwagandha root in reducing stress and anxiety in adults. Indian J Psychol Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/23439798/",
      },
    ],
  },
  {
    name: "Creatine Monohydrate",
    category: CompoundCategory.supplement,
    mechanismSummary:
      "Replenishes phosphocreatine stores to accelerate ATP regeneration during high-intensity effort; also supports cognitive energy metabolism.",
    citations: [
      {
        text: "Rawson ES & Volek JS (2003) Effects of creatine supplementation and resistance training on muscle strength and weightlifting performance. J Strength Cond Res.",
        url: "https://pubmed.ncbi.nlm.nih.gov/14636102/",
      },
    ],
  },
  {
    name: "Omega-3 (EPA/DHA)",
    category: CompoundCategory.supplement,
    mechanismSummary:
      "EPA inhibits COX-2 to reduce pro-inflammatory eicosanoid synthesis; DHA incorporates into neuronal phospholipid bilayers improving membrane fluidity.",
    citations: [
      {
        text: "Calder PC (2015) Marine omega-3 fatty acids and inflammatory processes: Effects, mechanisms and clinical relevance. Biochim Biophys Acta.",
        url: "https://pubmed.ncbi.nlm.nih.gov/25149823/",
      },
    ],
  },
  {
    name: "BPC-157",
    category: CompoundCategory.peptide,
    mechanismSummary:
      "Promotes angiogenesis and upregulates growth hormone receptor expression in tendon fibroblasts; demonstrates gut mucosal cytoprotection via NO pathway.",
    citations: [
      {
        text: "Sikiric P et al. (2018) Brain-gut Axis and Pentadecapeptide BPC 157: Theoretical and Practical Implications. Curr Neuropharmacol.",
        url: "https://pubmed.ncbi.nlm.nih.gov/27915988/",
      },
    ],
  },
  {
    name: "Semax",
    category: CompoundCategory.peptide,
    mechanismSummary:
      "ACTH(4-7) analogue that upregulates BDNF and NGF expression; activates TrkB signalling for neuroprotection and cognitive enhancement.",
    citations: [
      {
        text: "Dolotov OV et al. (2006) Semax, an analog of ACTH(4-7) with cognitive effects, regulates BDNF and trkB expression in the rat hippocampus. Brain Res.",
        url: "https://pubmed.ncbi.nlm.nih.gov/16580643/",
      },
    ],
  },
];

async function main() {
  for (const { citations, ...data } of compounds) {
    await prisma.compoundLibrary.upsert({
      where: { name: data.name },
      update: {},
      create: {
        ...data,
        citations: { create: citations },
      },
    });
  }
  console.log(`Seeded ${compounds.length} compounds`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
