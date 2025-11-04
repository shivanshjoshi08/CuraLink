
import type { User, Publication, Community, Post, Reply, Expert, ClinicalTrial } from './types';

// Expanded user base
export const users: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatarId: 'avatar-1', role: 'patient', conditions: ['Glioblastoma', 'Hypertension'] },
  { id: 'user-2', name: 'Dr. Bob Williams', email: 'bob@example.com', avatarId: 'avatar-2', role: 'researcher', specialty: 'Oncology' },
  { id: 'user-3', name: 'Dr. Carol White', email: 'carol@example.com', avatarId: 'avatar-3', role: 'researcher', specialty: 'Neuroscience' },
  { id: 'user-4', name: 'David Smith', email: 'david@example.com', avatarId: 'avatar-4', role: 'patient', conditions: ['Type 2 Diabetes'] },
  { id: 'user-5', name: 'Dr. Evelyn Reed', email: 'evelyn@example.com', avatarId: 'avatar-5', role: 'researcher', specialty: 'Cardiology' },
  { id: 'user-6', name: 'Frank Miller', email: 'frank@example.com', avatarId: 'avatar-6', role: 'patient', conditions: ['Lung Cancer'] },
  { id: 'user-7', name: 'Dr. George Martin', email: 'george@example.com', avatarId: 'avatar-7', role: 'researcher', specialty: 'Genetics' },
  { id: 'user-8', name: 'Dr. Helen Clark', email: 'helen@example.com', avatarId: 'avatar-8', role: 'researcher', specialty: 'Immunology' },
];

export const experts: Expert[] = users.filter(u => u.role === 'researcher') as Expert[];

export const publications: Publication[] = [
  {
    id: 'pub-1',
    title: 'Advancements in Glioblastoma Treatment Protocols',
    authors: ['Dr. Bob Williams', 'Dr. Eve Adams'],
    journal: 'Journal of Oncology',
    year: 2023,
    summary: 'This paper reviews the latest therapeutic strategies for glioblastoma, focusing on targeted therapies and immunotherapy.',
    imageId: 'publication-1',
    fullText: 'Glioblastoma (GBM) remains one of the most aggressive and difficult-to-treat brain tumors. Standard treatment, involving surgery followed by radiotherapy and chemotherapy with temozolomide (TMZ), has shown limited efficacy. In recent years, significant research has been dedicated to developing novel therapeutic strategies. This paper reviews recent advancements, including targeted molecular therapies aimed at specific genetic mutations such as IDH1/2, EGFR, and MGMT promoter methylation. Furthermore, we explore the burgeoning field of immunotherapy, including checkpoint inhibitors, CAR-T cell therapy, and vaccine strategies, which hold the promise of harnessing the patient\'s own immune system to fight the tumor. We will discuss the outcomes of recent clinical trials and the challenges that lie ahead, such as overcoming the blood-brain barrier and the immunosuppressive tumor microenvironment.'
  },
  {
    id: 'pub-2',
    title: 'The Role of CRISPR-Cas9 in Neurological Disorders',
    authors: ['Dr. Carol White'],
    journal: 'Neuroscience Today',
    year: 2024,
    summary: 'An overview of how CRISPR-Cas9 gene-editing technology is being explored for the treatment of various neurological conditions.',
    imageId: 'publication-2',
    fullText: 'The advent of CRISPR-Cas9 technology has revolutionized the field of genetic engineering. Its potential applications in medicine are vast, particularly for monogenic neurological disorders. This review summarizes the current state of research on using CRISPR-Cas9 to correct genetic mutations responsible for conditions like Huntington\'s disease, Duchenne muscular dystrophy, and certain forms of amyotrophic lateral sclerosis (ALS). We delve into the different delivery methods being tested to transport the CRISPR machinery into the central nervous system, including viral vectors like AAV and non-viral methods such as lipid nanoparticles. Safety concerns, including off-target effects and long-term consequences, are also critically examined. While still in early stages, the promise of a one-time curative treatment for these devastating diseases makes this a rapidly advancing area of research.'
  },
   {
    id: 'pub-3',
    title: 'Metabolic Syndromes and Brain Health',
    authors: ['Dr. Frank Green', 'Dr. Grace Hall'],
    journal: 'The Lancet Diabetes & Endocrinology',
    year: 2023,
    summary: 'Exploring the correlation between metabolic diseases like type 2 diabetes and the increased risk of neurodegenerative diseases.',
    imageId: 'publication-3',
    fullText: 'There is growing evidence linking metabolic syndrome—a cluster of conditions including high blood pressure, high blood sugar, excess body fat around the waist, and abnormal cholesterol levels—to cognitive decline and an increased risk of dementia, including Alzheimer\'s disease. This comprehensive study analyzes data from over 10,000 participants to investigate the pathophysiological mechanisms underlying this connection. We examine the roles of insulin resistance, chronic inflammation, and oxidative stress in the brain. Our findings suggest that systemic metabolic dysregulation contributes to neuroinflammation and impaired synaptic plasticity. This highlights the importance of managing metabolic health not just for cardiovascular well-being but also as a preventative strategy for preserving cognitive function in an aging population. Lifestyle interventions and pharmacological treatments for metabolic syndrome may offer a new avenue for reducing the global burden of dementia.'
  },
];

export const communities: Community[] = [
  { id: 'comm-1', name: 'Brain Tumor Support & Research', description: 'A forum for questions about brain tumors and ongoing research.', creatorId: 'user-2' },
  { id: 'comm-2', name: 'General Neurology Questions', description: 'Ask questions about neurological conditions.', creatorId: 'user-3' },
  { id: 'comm-3', name: 'Cardiology Corner', description: 'Discussions on heart health, treatment and research.', creatorId: 'user-5' },
];

export const posts: Post[] = [
  { id: 'post-1', title: 'Newly diagnosed with Glioblastoma - what are the most promising trials?', content: 'I was recently diagnosed with GBM and my oncologist mentioned clinical trials. It\'s all a bit overwhelming. I\'d love to hear from researchers about what areas of study seem most promising right now. Thank you.', authorId: 'user-1', communityId: 'comm-1', createdAt: '2024-05-20T10:00:00Z' },
  { id: 'post-2', title: 'Is CAR-T therapy a viable option for solid tumors like brain cancer?', content: 'I have read a lot about CAR-T being successful in blood cancers, but what about for solid tumors? What are the main challenges researchers are facing?', authorId: 'user-1', communityId: 'comm-1', createdAt: '2024-05-21T14:30:00Z' },
  { id: 'post-3', title: 'Managing Hypertension alongside other conditions', content: 'What are the latest recommendations for managing high blood pressure, especially when other medications are involved?', authorId: 'user-1', communityId: 'comm-3', createdAt: '2024-05-22T09:00:00Z' },
];

export const replies: Reply[] = [
  { id: 'reply-1', content: 'That\'s an excellent question. While GBM is challenging, there\'s significant progress in immunotherapy and targeted therapies. Specifically, trials focusing on IDH1 inhibitors for mutated tumors and new checkpoint inhibitors are showing promise. You can search for trials with keywords like "NCT03343197" or "pembrolizumab glioblastoma" on clinical trial registries.', authorId: 'user-2', postId: 'post-1', createdAt: '2024-05-20T11:30:00Z' },
  { id: 'reply-2', content: 'Another great question. The main hurdles for CAR-T in solid tumors are 1) identifying unique tumor antigens that aren\'t on healthy cells, and 2) the immunosuppressive tumor microenvironment that can "turn off" the CAR-T cells. Researchers are engineering "armored" CARs to resist this suppression. It\'s a very active area of study.', authorId: 'user-3', postId: 'post-2', createdAt: '2024-05-21T16:00:00Z' },
  { id: 'reply-3', content: 'For managing hypertension with comorbidities, combination therapy is often key. ACE inhibitors or ARBs are typically first-line, but your cardiologist will tailor the regimen based on your specific health profile. Regular monitoring is crucial.', authorId: 'user-5', postId: 'post-3', createdAt: '2024-05-22T10:00:00Z' },
];

export const trials: ClinicalTrial[] = [
    { id: 'trial-1', title: 'A Study of Pembrolizumab in Recurrent Glioblastoma', sponsor: 'Merck Sharp & Dohme LLC', phase: 2, status: 'Recruiting', description: 'This study will evaluate the efficacy and safety of pembrolizumab (MK-3475) in participants with recurrent glioblastoma.', imageId: 'trial-1'},
    { id: 'trial-2', title: 'Targeting IDH1 Mutation in Glioma', sponsor: 'Agios Pharmaceuticals', phase: 3, status: 'Active', description: 'A Phase 3, Multicenter, Randomized, Double-blind, Placebo-controlled Study of Ivosidenib (AG-120) in Patients With IDH1-mutant, Non-enhancing Glioma.', imageId: 'publication-2'},
    { id: 'trial-3', title: 'A Study to Evaluate the Efficacy and Safety of a New Drug for Lung Cancer', sponsor: 'Genentech, Inc.', phase: 3, status: 'Recruiting', description: 'This is a multicenter, randomized, double-blind, placebo-controlled study to evaluate the efficacy and safety of a new drug in combination with standard of care chemotherapy in patients with previously untreated advanced or metastatic non-small cell lung cancer (NSCLC).', imageId: 'trial-3' },
    { id: 'trial-4', title: 'Study of a New Treatment for Heart Failure', sponsor: 'Novartis', phase: 2, status: 'Completed', description: 'An open-label study to assess the long-term safety and tolerability of a new treatment for patients with chronic heart failure.', imageId: 'trial-4' },
]

let currentUserRole: 'patient' | 'researcher' = 'patient';

// Mock current user - switch between 'patient' and 'researcher' to test UI
export const getCurrentUser = (): User => {
    if (currentUserRole === 'researcher') {
        return users.find(u => u.id === 'user-2')!; 
    }
    return users.find(u => u.id === 'user-1')!;
}

export const setCurrentUserRole = (role: 'patient' | 'researcher') => {
    currentUserRole = role;
}
