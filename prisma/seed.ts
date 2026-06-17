import { configDotenv } from "dotenv";
import path from "node:path";

configDotenv({ path: path.resolve(process.cwd(), ".env.local") });

import { PrismaClient, CompoundCategory } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Supplements ───────────────────────────────────────────────────────────────
const supplements: {
  name: string;
  subcategory?: string;
  popularityRank?: number;
  mechanismSummary: string;
  citations: { text: string; url?: string }[];
}[] = [
  {
    name: "Creatine Monohydrate",
    subcategory: "performance",
    popularityRank: 1,
    mechanismSummary:
      "Replenishes phosphocreatine stores to accelerate ATP regeneration during high-intensity effort; also supports cognitive energy metabolism via cerebral creatine saturation.",
    citations: [
      {
        text: "Rawson ES & Volek JS (2003) Effects of creatine supplementation and resistance training on muscle strength and weightlifting performance. J Strength Cond Res.",
        url: "https://pubmed.ncbi.nlm.nih.gov/14636102/",
      },
    ],
  },
  {
    name: "Magnesium Glycinate",
    subcategory: "sleep",
    popularityRank: 2,
    mechanismSummary:
      "Modulates GABA-A receptor activity and reduces NMDA-mediated excitation, improving sleep onset latency and depth. Glycinate chelate improves bioavailability vs. oxide.",
    citations: [
      {
        text: "Abbasi B et al. (2012) The effect of magnesium supplementation on primary insomnia in elderly. J Res Med Sci.",
        url: "https://pubmed.ncbi.nlm.nih.gov/23853635/",
      },
    ],
  },
  {
    name: "Vitamin D3",
    subcategory: "longevity",
    popularityRank: 3,
    mechanismSummary:
      "Binds VDR nuclear receptor controlling >1000 genes; regulates calcium homeostasis, immune modulation, and neuromuscular function. Co-supplementation with K2 directs calcium to bone.",
    citations: [
      {
        text: "Holick MF (2007) Vitamin D deficiency. N Engl J Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/17634462/",
      },
    ],
  },
  {
    name: "Omega-3 (EPA/DHA)",
    subcategory: "cardiovascular",
    popularityRank: 4,
    mechanismSummary:
      "EPA inhibits COX-2 to reduce pro-inflammatory eicosanoid synthesis; DHA incorporates into neuronal phospholipid bilayers improving membrane fluidity and synaptic signalling.",
    citations: [
      {
        text: "Calder PC (2015) Marine omega-3 fatty acids and inflammatory processes. Biochim Biophys Acta.",
        url: "https://pubmed.ncbi.nlm.nih.gov/25149823/",
      },
    ],
  },
  {
    name: "Ashwagandha (KSM-66)",
    subcategory: "adaptogen",
    popularityRank: 5,
    mechanismSummary:
      "HPA-axis modulation via withanolide glycosides; reduces serum cortisol and perceived stress scores. KSM-66 is a full-spectrum root extract with >5% withanolides.",
    citations: [
      {
        text: "Chandrasekhar K et al. (2012) Safety and efficacy of a high-concentration full-spectrum extract of Ashwagandha root. Indian J Psychol Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/23439798/",
      },
    ],
  },
  {
    name: "L-Theanine",
    subcategory: "cognitive",
    popularityRank: 6,
    mechanismSummary:
      "Crosses the blood-brain barrier; increases alpha-wave activity and modulates GABA and glutamate neurotransmission. Synergistic with caffeine: attenuates jitter while preserving alertness.",
    citations: [
      {
        text: "Nobre AC et al. (2008) L-theanine, a natural constituent in tea, and its effect on mental state. Asia Pac J Clin Nutr.",
        url: "https://pubmed.ncbi.nlm.nih.gov/19580915/",
      },
    ],
  },
  {
    name: "Zinc (Bisglycinate)",
    subcategory: "hormonal",
    popularityRank: 7,
    mechanismSummary:
      "Cofactor for >300 enzymes; required for testosterone synthesis via 5α-reductase regulation and LH receptor signalling. Bisglycinate chelate offers superior absorption to oxide.",
    citations: [
      {
        text: "Prasad AS et al. (1996) Zinc status and serum testosterone levels of healthy adults. Nutrition.",
        url: "https://pubmed.ncbi.nlm.nih.gov/8875519/",
      },
    ],
  },
  {
    name: "Berberine",
    subcategory: "metabolic",
    popularityRank: 8,
    mechanismSummary:
      "AMPK activator that mimics exercise signalling; reduces hepatic glucose output and improves insulin sensitivity. Comparable HbA1c reduction to metformin in several RCTs.",
    citations: [
      {
        text: "Yin J et al. (2008) Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18442638/",
      },
    ],
  },
  {
    name: "NMN (Nicotinamide Mononucleotide)",
    subcategory: "longevity",
    popularityRank: 9,
    mechanismSummary:
      "Direct precursor to NAD⁺; bypasses rate-limiting NAMPT step. Restores NAD⁺ levels that decline with age, supporting sirtuin activity, mitochondrial biogenesis, and DNA repair.",
    citations: [
      {
        text: "Yoshino M et al. (2021) Nicotinamide mononucleotide increases muscle insulin sensitivity in prediabetic women. Science.",
        url: "https://pubmed.ncbi.nlm.nih.gov/34385400/",
      },
    ],
  },
  {
    name: "Alpha-GPC",
    subcategory: "cognitive",
    popularityRank: 10,
    mechanismSummary:
      "Highly bioavailable choline source that crosses the BBB; precursor to acetylcholine synthesis. Increases GH release acutely and supports cholinergic neuroplasticity.",
    citations: [
      {
        text: "Bellar D et al. (2015) The effect of 6 days of alpha glycerylphosphorylcholine on isometric strength. J Int Soc Sports Nutr.",
        url: "https://pubmed.ncbi.nlm.nih.gov/26582972/",
      },
    ],
  },
  {
    name: "Lion's Mane Mushroom",
    subcategory: "cognitive",
    popularityRank: 11,
    mechanismSummary:
      "Hericenones and erinacines stimulate Nerve Growth Factor (NGF) synthesis; promotes neurogenesis in the hippocampus. Associated with improved mild cognitive impairment scores in RCTs.",
    citations: [
      {
        text: "Mori K et al. (2009) Improving effects of the mushroom Yamabushitake on mild cognitive impairment. Phytother Res.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18844328/",
      },
    ],
  },
  {
    name: "Melatonin",
    subcategory: "sleep",
    popularityRank: 12,
    mechanismSummary:
      "Endogenous circadian zeitgeber secreted by the pineal gland in response to darkness; acts on MT1/MT2 receptors to reduce sleep onset latency. Low doses (0.3–0.5 mg) are physiological.",
    citations: [
      {
        text: "Brzezinski A (1997) Melatonin in humans. N Engl J Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/9099329/",
      },
    ],
  },
  {
    name: "CoQ10 (Ubiquinol)",
    subcategory: "cardiovascular",
    popularityRank: 13,
    mechanismSummary:
      "Electron carrier in mitochondrial ETC (Complex I–III); potent lipid-phase antioxidant. Ubiquinol (reduced form) has superior bioavailability vs ubiquinone. Depleted by statins.",
    citations: [
      {
        text: "Mortensen SA et al. (2014) The effect of coenzyme Q10 on morbidity and mortality in chronic heart failure. JACC Heart Fail.",
        url: "https://pubmed.ncbi.nlm.nih.gov/25065663/",
      },
    ],
  },
  {
    name: "Taurine",
    subcategory: "cardiovascular",
    popularityRank: 14,
    mechanismSummary:
      "Conditional amino acid abundant in cardiac and skeletal muscle; regulates calcium handling, mitochondrial membrane potential, and osmotic stress response. Potential longevity mechanism via sulfinylation pathways.",
    citations: [
      {
        text: "Singh P et al. (2023) Taurine deficiency as a driver of aging. Science.",
        url: "https://pubmed.ncbi.nlm.nih.gov/37289912/",
      },
    ],
  },
  {
    name: "Glycine",
    subcategory: "sleep",
    popularityRank: 15,
    mechanismSummary:
      "Inhibitory neurotransmitter that reduces core body temperature via peripheral vasodilation, improving sleep quality. Also key for collagen synthesis and glutathione production.",
    citations: [
      {
        text: "Bannai M et al. (2012) New therapeutic strategy for amino acid medicine: glycine improves the quality of sleep. J Pharmacol Sci.",
        url: "https://pubmed.ncbi.nlm.nih.gov/22293292/",
      },
    ],
  },
  {
    name: "Rhodiola Rosea",
    subcategory: "adaptogen",
    popularityRank: 16,
    mechanismSummary:
      "Adaptogenic herb; salidroside and rosavin inhibit monoamine oxidase and stimulate serotonin/dopamine synthesis. Reduces burnout scores and physical fatigue in RCTs.",
    citations: [
      {
        text: "Shevtsov VA et al. (2003) A randomized trial of two different doses of Rhodiola rosea extract versus placebo. Phytomedicine.",
        url: "https://pubmed.ncbi.nlm.nih.gov/12725561/",
      },
    ],
  },
  {
    name: "Apigenin",
    subcategory: "sleep",
    popularityRank: 17,
    mechanismSummary:
      "Flavone that binds GABA-A receptors (benzodiazepine site) as a partial agonist; reduces anxiety and promotes sleep without significant tolerance. Also a CD38 inhibitor supporting NAD⁺ levels.",
    citations: [
      {
        text: "Viola H et al. (1995) Apigenin, a component of Matricaria recutita flowers, is a central benzodiazepine receptors-ligand with anxiolytic effects. Planta Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/7480661/",
      },
    ],
  },
  {
    name: "Resveratrol",
    subcategory: "longevity",
    popularityRank: 18,
    mechanismSummary:
      "Polyphenol stilbene that activates SIRT1 and AMPK; mimics caloric restriction signalling. Bioavailability is low but substantially improved with trans-resveratrol + piperine or micronized forms.",
    citations: [
      {
        text: "Lagouge M et al. (2006) Resveratrol improves mitochondrial function and protects against metabolic disease by activating SIRT1 and PGC-1α. Cell.",
        url: "https://pubmed.ncbi.nlm.nih.gov/17112576/",
      },
    ],
  },
  {
    name: "Quercetin",
    subcategory: "longevity",
    popularityRank: 19,
    mechanismSummary:
      "Senolytic flavonoid that selectively induces apoptosis in senescent cells; also a potent antioxidant and mast cell stabilizer. Best absorbed with bromelain or EGCG.",
    citations: [
      {
        text: "Xu M et al. (2018) Senolytics improve physical function and increase lifespan in old age. Nat Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/29988130/",
      },
    ],
  },
  {
    name: "Beta-Alanine",
    subcategory: "performance",
    popularityRank: 20,
    mechanismSummary:
      "Rate-limiting precursor to carnosine synthesis in skeletal muscle; carnosine buffers intracellular pH during high-intensity exercise, delaying fatigue. Causes transient paresthesia (flushing).",
    citations: [
      {
        text: "Hobson RM et al. (2012) Effects of β-alanine supplementation on exercise performance: a meta-analysis. Amino Acids.",
        url: "https://pubmed.ncbi.nlm.nih.gov/22270875/",
      },
    ],
  },
  {
    name: "Citrulline Malate",
    subcategory: "performance",
    popularityRank: 21,
    mechanismSummary:
      "Urea cycle intermediate that raises plasma arginine more effectively than arginine itself; increases NO bioavailability, reducing blood pressure and improving exercise capacity.",
    citations: [
      {
        text: "Pérez-Guisado J & Jakeman PM (2010) Citrulline malate enhances athletic anaerobic performance and relieves muscle soreness. J Strength Cond Res.",
        url: "https://pubmed.ncbi.nlm.nih.gov/20386132/",
      },
    ],
  },
  {
    name: "Phosphatidylserine",
    subcategory: "cognitive",
    popularityRank: 22,
    mechanismSummary:
      "Phospholipid constituent of neural membranes; supports neurotransmitter receptor density and blunts HPA axis response to exercise stress. FDA-qualified health claim for cognitive decline.",
    citations: [
      {
        text: "Benton D et al. (2001) The influence of phosphatidylserine supplementation on mood and heart rate when faced with an acute stressor. Nutr Neurosci.",
        url: "https://pubmed.ncbi.nlm.nih.gov/11842884/",
      },
    ],
  },
  {
    name: "Bacopa Monnieri",
    subcategory: "cognitive",
    popularityRank: 23,
    mechanismSummary:
      "Adaptogenic herb; bacosides enhance dendritic branching in hippocampal neurons and modulate acetylcholinesterase activity. Effects on memory consolidation emerge after 8–12 weeks.",
    citations: [
      {
        text: "Stough C et al. (2001) The chronic effects of an extract of Bacopa monniera on cognitive function in healthy human subjects. Psychopharmacology.",
        url: "https://pubmed.ncbi.nlm.nih.gov/11498727/",
      },
    ],
  },
  {
    name: "Metformin",
    subcategory: "metabolic",
    popularityRank: 24,
    mechanismSummary:
      "Biguanide that activates AMPK by inhibiting Complex I of the mitochondrial ETC; reduces hepatic glucose production and may extend healthspan via mTOR suppression. Used off-label for longevity.",
    citations: [
      {
        text: "Campbell JM et al. (2017) Metformin reduces all-cause mortality and diseases of ageing independent of its effect on diabetes control. Ageing Res Rev.",
        url: "https://pubmed.ncbi.nlm.nih.gov/28802803/",
      },
    ],
  },
  {
    name: "NR (Nicotinamide Riboside)",
    subcategory: "longevity",
    popularityRank: 25,
    mechanismSummary:
      "NAD⁺ precursor that enters the salvage pathway via NRK1/2 kinases; raises blood NAD⁺ in humans in RCTs. Slightly different tissue distribution vs NMN — NR may preferentially elevate hepatic NAD⁺.",
    citations: [
      {
        text: "Trammell SA et al. (2016) Nicotinamide riboside is uniquely and orally bioavailable in healthy humans. Nat Commun.",
        url: "https://pubmed.ncbi.nlm.nih.gov/27721479/",
      },
    ],
  },
  {
    name: "Spermidine",
    subcategory: "longevity",
    popularityRank: 26,
    mechanismSummary:
      "Polyamine that induces autophagy via EP300 acetyltransferase inhibition; declines with age. Associated with reduced cardiovascular mortality and extended lifespan in multiple model organisms.",
    citations: [
      {
        text: "Madeo F et al. (2018) Spermidine in health and disease. Science.",
        url: "https://pubmed.ncbi.nlm.nih.gov/29345578/",
      },
    ],
  },
  {
    name: "Vitamin K2 (MK-7)",
    subcategory: "cardiovascular",
    popularityRank: 27,
    mechanismSummary:
      "Activates matrix Gla protein (MGP) and osteocalcin; directs calcium away from arterial walls toward bone. MK-7 has a half-life of ~72 hours vs MK-4's 1–2 hours.",
    citations: [
      {
        text: "Geleijnse JM et al. (2004) Dietary intake of menaquinone is associated with a reduced risk of coronary heart disease. J Nutr.",
        url: "https://pubmed.ncbi.nlm.nih.gov/15514282/",
      },
    ],
  },
  {
    name: "Alpha-Lipoic Acid (ALA)",
    subcategory: "metabolic",
    popularityRank: 28,
    mechanismSummary:
      "Amphipathic antioxidant cofactor for mitochondrial enzymes (pyruvate dehydrogenase); regenerates vitamins C and E. R-ALA is the biologically active enantiomer.",
    citations: [
      {
        text: "Packer L et al. (1995) Alpha-lipoic acid as a biological antioxidant. Free Radic Biol Med.",
        url: "https://pubmed.ncbi.nlm.nih.gov/7649494/",
      },
    ],
  },
  {
    name: "Collagen Peptides",
    subcategory: "recovery",
    popularityRank: 29,
    mechanismSummary:
      "Hydrolysed type I/II collagen provides proline and hydroxyproline; stimulates fibroblast collagen synthesis when taken with vitamin C ~1 hour before loading exercise.",
    citations: [
      {
        text: "Shaw G et al. (2017) Vitamin C-enriched gelatin supplementation before intermittent activity augments collagen synthesis. Am J Clin Nutr.",
        url: "https://pubmed.ncbi.nlm.nih.gov/27852613/",
      },
    ],
  },
  {
    name: "EGCG (Green Tea Extract)",
    subcategory: "longevity",
    popularityRank: 30,
    mechanismSummary:
      "Catechin polyphenol that inhibits COMT, amplifying catecholamine signalling; antioxidant via Nrf2 activation; synergistic senolytic with quercetin. Also inhibits DYRK1A (potential cognitive benefit).",
    citations: [
      {
        text: "Yang CS et al. (2009) Cancer prevention by tea. Nat Rev Cancer.",
        url: "https://pubmed.ncbi.nlm.nih.gov/19238148/",
      },
    ],
  },
];

// ── Peptides ──────────────────────────────────────────────────────────────────
const peptides: {
  name: string;
  subcategory?: string;
  popularityRank?: number;
  mechanismSummary: string;
  citations: { text: string; url?: string }[];
}[] = [
  {
    name: "BPC-157",
    subcategory: "tissue repair",
    popularityRank: 1,
    mechanismSummary:
      "Promotes angiogenesis and upregulates growth hormone receptor expression in tendon fibroblasts; demonstrates gut mucosal cytoprotection via nitric oxide and VEGF pathways.",
    citations: [
      {
        text: "Sikiric P et al. (2018) Brain-gut Axis and Pentadecapeptide BPC 157. Curr Neuropharmacol.",
        url: "https://pubmed.ncbi.nlm.nih.gov/27915988/",
      },
    ],
  },
  {
    name: "TB-500 (Thymosin Beta-4)",
    subcategory: "tissue repair",
    popularityRank: 2,
    mechanismSummary:
      "Synthetic fragment of thymosin β4; sequesters G-actin to regulate cytoskeletal dynamics, promoting cell migration, angiogenesis, and wound healing. Anti-fibrotic properties in cardiac tissue.",
    citations: [
      {
        text: "Goldstein AL et al. (2012) Thymosin β4: a multi-functional regenerative peptide. Expert Opin Biol Ther.",
        url: "https://pubmed.ncbi.nlm.nih.gov/22236196/",
      },
    ],
  },
  {
    name: "GHK-Cu (Copper Peptide)",
    subcategory: "anti-aging",
    popularityRank: 3,
    mechanismSummary:
      "Tripeptide-copper complex that resets gene expression patterns toward a younger phenotype; upregulates collagen, elastin, and superoxide dismutase while downregulating inflammatory genes.",
    citations: [
      {
        text: "Pickart L & Margolina A (2018) Regenerative and Protective Actions of the GHK-Cu Peptide. Int J Mol Sci.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30012970/",
      },
    ],
  },
  {
    name: "Semax",
    subcategory: "cognitive",
    popularityRank: 4,
    mechanismSummary:
      "ACTH(4-7) analogue that upregulates BDNF and NGF expression; activates TrkB signalling for neuroprotection and cognitive enhancement. Widely used in Russia for stroke recovery.",
    citations: [
      {
        text: "Dolotov OV et al. (2006) Semax, an analog of ACTH(4-7) with cognitive effects, regulates BDNF and trkB expression in the rat hippocampus. Brain Res.",
        url: "https://pubmed.ncbi.nlm.nih.gov/16580643/",
      },
    ],
  },
  {
    name: "Selank",
    subcategory: "cognitive",
    popularityRank: 5,
    mechanismSummary:
      "Synthetic heptapeptide analogue of tuftsin; anxiolytic via serotonin and GABA modulation without sedation. Enhances memory via BDNF upregulation and enkephalin stabilisation.",
    citations: [
      {
        text: "Uchakina ON et al. (2008) Immunomodulatory effects of selank in patients with anxiety-asthenic disorders. Zh Nevrol Psikhiatr Im S S Korsakova.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18833973/",
      },
    ],
  },
  {
    name: "Epithalon (Epitalon)",
    subcategory: "anti-aging",
    popularityRank: 6,
    mechanismSummary:
      "Tetrapeptide that stimulates telomerase activity, elongating telomeres in human somatic cells in vitro; regulates circadian melatonin secretion. Developed by the St. Petersburg Institute of Bioregulation.",
    citations: [
      {
        text: "Khavinson VK et al. (2003) Synthetic tetrapeptide epitalon restores disturbed neuroendocrine regulation in senescent monkeys. Neuro Endocrinol Lett.",
        url: "https://pubmed.ncbi.nlm.nih.gov/14523375/",
      },
    ],
  },
  {
    name: "Ipamorelin",
    subcategory: "growth hormone",
    popularityRank: 7,
    mechanismSummary:
      "Selective GH secretagogue receptor agonist (ghrelin mimetic); stimulates pulsatile GH release without significantly raising cortisol or prolactin. Often stacked with CJC-1295.",
    citations: [
      {
        text: "Raun K et al. (1998) Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol.",
        url: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
      },
    ],
  },
  {
    name: "CJC-1295",
    subcategory: "growth hormone",
    popularityRank: 8,
    mechanismSummary:
      "GHRH analogue with a drug affinity complex (DAC) that extends half-life to ~6–8 days via albumin binding; sustains GH pulse amplitude. Non-DAC version (Mod GRF 1-29) has ~30-minute half-life.",
    citations: [
      {
        text: "Teichman SL et al. (2006) Prolonged stimulation of growth hormone and insulin-like growth factor I secretion by CJC-1295. J Clin Endocrinol Metab.",
        url: "https://pubmed.ncbi.nlm.nih.gov/16595603/",
      },
    ],
  },
  {
    name: "PT-141 (Bremelanotide)",
    subcategory: "sexual health",
    popularityRank: 9,
    mechanismSummary:
      "Melanocortin receptor agonist (MC3R/MC4R) that acts centrally in the hypothalamus to increase sexual arousal in both sexes. FDA-approved for HSDD in premenopausal women (Vyleesi).",
    citations: [
      {
        text: "Clayton AH et al. (2019) Bremelanotide for female sexual dysfunctions in premenopausal women. Womens Health.",
        url: "https://pubmed.ncbi.nlm.nih.gov/30858012/",
      },
    ],
  },
  {
    name: "DSIP (Delta Sleep-Inducing Peptide)",
    subcategory: "sleep",
    popularityRank: 10,
    mechanismSummary:
      "Endogenous neuropeptide that promotes delta-wave (slow-wave) sleep; reduces ACTH and corticosterone stress response; antioxidant properties via Nrf2 pathway.",
    citations: [
      {
        text: "Schoenenberger GA & Monnier M (1977) Characterization of a delta-sleep-inducing peptide from rabbit blood. Proc Natl Acad Sci.",
        url: "https://pubmed.ncbi.nlm.nih.gov/270951/",
      },
    ],
  },
  {
    name: "KPV",
    subcategory: "gut health",
    popularityRank: 11,
    mechanismSummary:
      "C-terminal tripeptide of alpha-MSH; anti-inflammatory via NF-κB inhibition in gut epithelial and immune cells. Shows efficacy in colitis models via luminal (oral or rectal) delivery.",
    citations: [
      {
        text: "Dalmasso G et al. (2008) The peptide KPV inhibits colitis through down-regulation of inflammatory pathways. PLoS One.",
        url: "https://pubmed.ncbi.nlm.nih.gov/18587437/",
      },
    ],
  },
  {
    name: "SS-31 (Elamipretide)",
    subcategory: "mitochondrial",
    popularityRank: 12,
    mechanismSummary:
      "Cardiolipin-targeting tetrapeptide that concentrates in the inner mitochondrial membrane; reduces ROS production and restores ATP synthesis. In clinical trials for heart failure and rare mitochondrial diseases.",
    citations: [
      {
        text: "Szeto HH (2014) First-in-class cardiolipin-protective compound as a therapeutic agent to restore mitochondrial bioenergetics. Br J Pharmacol.",
        url: "https://pubmed.ncbi.nlm.nih.gov/24117398/",
      },
    ],
  },
  {
    name: "MOTS-c",
    subcategory: "mitochondrial",
    popularityRank: 13,
    mechanismSummary:
      "Mitochondria-derived peptide encoded in the 12S rRNA gene; activates AMPK and Nrf2, improving insulin sensitivity and exercise capacity. Circulating levels decline with age.",
    citations: [
      {
        text: "Lee C et al. (2015) The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis and reduces obesity and insulin resistance. Cell Metab.",
        url: "https://pubmed.ncbi.nlm.nih.gov/25738459/",
      },
    ],
  },
  {
    name: "Humanin",
    subcategory: "mitochondrial",
    popularityRank: 14,
    mechanismSummary:
      "Mitochondria-derived peptide with cytoprotective, anti-apoptotic properties; reduces neuronal cell death in Alzheimer's models and improves insulin sensitivity. Levels decline ~40% per decade after age 30.",
    citations: [
      {
        text: "Muzumdar RH et al. (2009) Humanin: a novel central regulator of peripheral insulin action. PLoS One.",
        url: "https://pubmed.ncbi.nlm.nih.gov/19918361/",
      },
    ],
  },
  {
    name: "5-Amino-1MQ",
    subcategory: "metabolic",
    popularityRank: 15,
    mechanismSummary:
      "Small-molecule NNMT inhibitor (nicotinamide N-methyltransferase); blocks methyl group consumption in fat tissue, raising SAM-e levels and promoting fat cell shrinkage. Preclinical anti-obesity data.",
    citations: [
      {
        text: "Neelakantan H et al. (2018) Selective and membrane-permeable small molecule inhibitors of nicotinamide N-methyltransferase. Biochem Pharmacol.",
        url: "https://pubmed.ncbi.nlm.nih.gov/29432714/",
      },
    ],
  },
];

// ── TRT ───────────────────────────────────────────────────────────────────────
const trtCompounds: {
  name: string;
  subcategory?: string;
  popularityRank?: number;
  halfLifeHours?: number;
  mechanismSummary: string;
  citations: { text: string; url?: string }[];
}[] = [
  {
    name: "Testosterone Cypionate",
    subcategory: "long-ester",
    popularityRank: 1,
    halfLifeHours: 192, // ~8 days
    mechanismSummary:
      "Testosterone ester with a cyclopentylpropionate side chain; depot injection releases testosterone over ~8-day half-life after ester cleavage. Standard TRT protocol in the United States.",
    citations: [
      {
        text: "Bhasin S et al. (2010) Testosterone therapy in men with androgen deficiency syndromes: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab.",
        url: "https://pubmed.ncbi.nlm.nih.gov/20525905/",
      },
    ],
  },
  {
    name: "Testosterone Enanthate",
    subcategory: "long-ester",
    popularityRank: 2,
    halfLifeHours: 108, // ~4.5 days
    mechanismSummary:
      "Testosterone ester with an enanthate (heptanoate) side chain; ~4.5-day half-life. Predominant TRT formulation in Europe. Interchangeable with cypionate clinically; slightly faster clearance.",
    citations: [
      {
        text: "Bhasin S et al. (2010) Testosterone therapy in men with androgen deficiency syndromes. J Clin Endocrinol Metab.",
        url: "https://pubmed.ncbi.nlm.nih.gov/20525905/",
      },
    ],
  },
  {
    name: "Testosterone Propionate",
    subcategory: "short-ester",
    popularityRank: 3,
    halfLifeHours: 19.5,
    mechanismSummary:
      "Shortest-acting injectable ester (~19-hour half-life); allows rapid dose titration and faster washout. Requires every-other-day or daily injections to maintain stable levels.",
    citations: [
      {
        text: "Nieschlag E & Behre HM (2004) Testosterone: Action, Deficiency, Substitution. Cambridge University Press.",
        url: "https://pubmed.ncbi.nlm.nih.gov/20525905/",
      },
    ],
  },
  {
    name: "Testosterone Undecanoate (Injectable)",
    subcategory: "ultra-long-ester",
    popularityRank: 4,
    halfLifeHours: 814, // ~33.9 days
    mechanismSummary:
      "Castor oil-based depot injection (Nebido/Aveed) with ~34-day half-life; allows once-every-10-week dosing after loading. Avoids daily/weekly injections at the cost of less precise control.",
    citations: [
      {
        text: "Wang C et al. (2004) Pharmacokinetics of injectable testosterone undecanoate. Bailliere's Best Pract Res Clin Endocrinol Metab.",
        url: "https://pubmed.ncbi.nlm.nih.gov/15298133/",
      },
    ],
  },
  {
    name: "Testosterone Suspension",
    subcategory: "ester-free",
    popularityRank: 5,
    halfLifeHours: 24,
    mechanismSummary:
      "Unesterified testosterone in water suspension; fastest-acting injectable with ~24-hour half-life. No ester cleavage required; 100 mg = 100 mg testosterone. Requires daily injection for stability.",
    citations: [
      {
        text: "Nieschlag E et al. (2012) Testosterone: Action, Deficiency, Substitution (4th ed). Cambridge University Press.",
        url: "https://pubmed.ncbi.nlm.nih.gov/20525905/",
      },
    ],
  },
  {
    name: "Testosterone Cream (Transdermal)",
    subcategory: "transdermal",
    popularityRank: 6,
    halfLifeHours: 12,
    mechanismSummary:
      "Topical delivery bypasses first-pass metabolism; variable absorption based on application site (scrotum > inner arm > shoulder). DHT conversion higher than injections due to 5α-reductase in skin.",
    citations: [
      {
        text: "Grober ED et al. (2010) Scrotal compared to non-scrotal testosterone cream. Andrology.",
        url: "https://pubmed.ncbi.nlm.nih.gov/23378007/",
      },
    ],
  },
];

// ── Seed runner ───────────────────────────────────────────────────────────────
async function upsertCompound(
  data: {
    name: string;
    subcategory?: string;
    popularityRank?: number;
    halfLifeHours?: number;
    mechanismSummary: string;
    citations: { text: string; url?: string }[];
  },
  category: CompoundCategory
) {
  await prisma.compoundLibrary.upsert({
    where: { name: data.name },
    update: {
      subcategory: data.subcategory,
      popularityRank: data.popularityRank,
      halfLifeHours: data.halfLifeHours ?? null,
      mechanismSummary: data.mechanismSummary,
      category,
    },
    create: {
      name: data.name,
      category,
      subcategory: data.subcategory,
      popularityRank: data.popularityRank,
      halfLifeHours: data.halfLifeHours,
      mechanismSummary: data.mechanismSummary,
      citations: { create: data.citations },
    },
  });
}

async function main() {
  for (const c of supplements) {
    await upsertCompound(c, CompoundCategory.supplement);
  }
  for (const c of peptides) {
    await upsertCompound(c, CompoundCategory.peptide);
  }
  for (const c of trtCompounds) {
    await upsertCompound(c, CompoundCategory.trt);
  }
  console.log(
    `Seeded ${supplements.length} supplements, ${peptides.length} peptides, ${trtCompounds.length} TRT compounds.`
  );
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
