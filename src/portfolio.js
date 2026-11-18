export const person = {
  name: 'Varun Teja Goud',
  email: 'varun.goud2909@gmail.com',
  resume: '/varun-teja-goud-resume.pdf',
  github: 'https://github.com/varun3009',
  linkedin: 'https://www.linkedin.com/in/varuntec/',
  leetcode: 'https://leetcode.com/u/varun_tec/',
  codeforces: 'https://codeforces.com/profile/Varun_tec',
}

export const sections = [
  ['top', 'Home'], ['about', 'About'], ['experience', 'Experience'],
  ['lab', 'Lab'], ['projects', 'Projects'], ['coding', 'Problem solving'],
  ['research', 'Research'], ['writing', 'Writing'], ['skills', 'Skills'],
  ['fit', 'Role fit'], ['terminal', 'Terminal'], ['contact', 'Contact'],
]

export const metrics = [
  { value: '10K+', label: 'orders / day', detail: 'Incremental Shopify order ingestion at DeltaX.', target: 'experience', role: 'deltax' },
  { value: '20+', label: 'services using the SDK', detail: 'One .NET SDK across AWS S3 and Azure Blob.', target: 'experience', role: 'deltax' },
  { value: '200+', label: 'client accounts', detail: 'Email scheduling and tracking at DeltaX.', target: 'experience', role: 'deltax' },
  { value: '1,000+', label: 'problems solved', detail: 'Practice and contests across coding platforms.', target: 'coding' },
]

export const experience = [
  {
    id: 'deltax', company: 'DeltaX', role: 'Associate Product Engineer (Full-time)', dates: 'Feb 2024 – Jul 2025', location: 'Hyderabad, India', kind: 'Production engineering',
    summary: 'Built production services for messaging, commerce data, cloud storage, and enterprise access control.',
    impact: [
      ['200+', 'email client accounts'], ['100+', 'Meta business accounts'], ['10K+', 'Shopify orders / day'],
      ['20+', 'services using the SDK'], ['50+', 'granular permissions'],
    ],
    bullets: [
      'Architected email scheduling and tracking with C#, .NET, SQL Server, and background workers for 200+ client accounts, replacing manual follow-up checks with real-time visibility into sent email.',
      'Built a unified Instagram and Facebook inbox with Meta Graph APIs and webhooks, consolidating conversations from 100+ business accounts and delivering messages in seconds.',
      'Optimized incremental Shopify API ingestion to process 10K+ orders per day, skipping unchanged data on re-syncs and powering first-time-buyer segmentation and trending-product analytics.',
      'Published a NuGet SDK for AWS S3 and Azure Blob that replaced duplicate storage integrations across 20+ services. Applications could switch storage providers without code changes.',
      'Implemented enterprise role-based access control in C# and .NET with 50+ granular permissions and self-service onboarding, replacing manual provisioning and reducing support effort.',
    ],
    stack: ['C#', '.NET', 'SQL Server', 'Background jobs', 'Meta Graph APIs', 'Webhooks', 'Shopify API', 'NuGet', 'AWS S3', 'Azure Blob'],
  },
  {
    id: 'ub', company: 'University at Buffalo', role: 'Graduate Researcher', dates: 'Feb 2026 – Present', location: 'Buffalo, NY', kind: 'Current · Applied AI',
    summary: 'Build computer vision and generative modeling pipelines, from dataset construction through multi-GPU training.',
    impact: [['400K', 'handwriting samples'], ['399', 'handwriting styles'], ['4', 'NVIDIA A5000 GPUs']],
    bullets: [
      'Combined YOLO and ByteTrack to assign persistent IDs to potholes across dashcam frames, consolidating repeated detections into a single road defect.',
      'Built a dataset of 400K handwriting samples across 399 styles and trained VAE and T5 models using PyTorch DDP on four NVIDIA A5000 GPUs. The models reached training losses of 0.10 for VAE and 0.68 for T5.',
    ],
    stack: ['Python', 'PyTorch', 'YOLO', 'ByteTrack', 'VAE', 'T5', 'DDP'],
  },
  {
    id: 'safety', company: 'Safety Knights', role: 'Software Engineer Intern', dates: 'Aug 2025 – Dec 2025', location: 'Buffalo, NY', kind: 'Full-stack engineering',
    summary: 'Gave admins control over community rewards and helped members find nearby safety resources.',
    impact: [['10K+', 'locations on Mapbox'], ['3', 'activity signals for badges']],
    bullets: [
      'Built a configurable badge-rules engine and admin interface for post, active-day, and follower milestones, so staff could launch new rewards without code changes.',
      'Added backend coordinate support and mapped 10K+ user locations in an interactive Mapbox view, surfacing user concentration and nearby safety resources.',
    ],
    stack: ['Angular', 'Node.js', 'MongoDB', 'Mapbox', 'REST APIs'],
  },
]

export const projects = [
  {
    id: 'agentql', title: 'AgentQL', subtitle: 'Multi-agent SQL assistant', category: 'AI & ML', type: 'Featured project',
    summary: 'A stateful LangGraph workflow that turns natural-language requests into executed SQL and explains the results.',
    problem: 'A single prompt leaves too much implicit when a request is ambiguous or the database schema is unfamiliar.',
    approach: 'Six LangGraph agents divide the workflow across routing and clarification, schema discovery, SQL generation and execution, analysis, and response formatting. Stateful threads can pause and resume, and queries are validated by operation class.',
    outcome: 'Supports CREATE, INSERT, SELECT, and UPDATE, with paginated conversation history. The app was deployed on AWS Amplify and EC2.',
    stack: ['Python', 'Flask', 'React', 'LangGraph', 'AWS'],
    repo: 'https://github.com/varun3009/AgentQL', demo: 'https://main.d3f2cdwvs5pew1.amplifyapp.com/',
    diagram: ['Question', 'LangGraph', 'SQL engine', 'Answer'],
    nodes: [
      'The workflow routes the request and can pause for user clarification.',
      'Agents inspect the schema and generate SQL for the requested operation.',
      'The workflow validates the SQL operation class and executes the query.',
      'Analysis and formatting turn SQL results into a response in the conversation thread.',
    ],
    challenge: 'Database requests can be ambiguous. The workflow preserves state while it asks for clarification and resumes the run after the user responds.',
  },
  {
    id: 'movieverse', title: 'MovieVerse', subtitle: 'Distributed movie platform', category: 'Backend & Cloud', type: 'Personal project',
    summary: 'An event-driven image pipeline that keeps resizing and watermarking off the API request path.',
    problem: 'Movie poster processing takes longer than accepting the upload. Doing both in one request ties API responsiveness to unpredictable image work.',
    approach: 'A JWT-protected .NET API hands work to RabbitMQ. Python workers resize posters to 400 × 200, apply watermarks, persist assets in S3, and publish a completion event. Redis caches completed results.',
    outcome: 'Two queues separate work requests and completion events, so the API and image processors can operate independently.',
    stack: ['C#', 'ASP.NET Core', 'Vue.js', 'Python', 'RabbitMQ', 'Redis', 'SQL Server', 'AWS', 'Docker', 'Nginx'],
    repo: 'https://github.com/varun3009/movieverse', demo: 'https://web.redvaruntec.xyz/',
    diagram: ['.NET API', 'RabbitMQ', 'Python worker', 'S3 + Redis'],
    nodes: [
      'The JWT-protected ASP.NET Core API accepts and validates the upload before handing off the image job.',
      'Two RabbitMQ queues separate processing requests and completion events.',
      'Python workers resize and watermark posters outside the synchronous API path.',
      'S3 stores the transformed asset and Redis provides fast access to cached results.',
    ],
    challenge: 'Separating the API from the image-processing worker adds a completion handoff. The second queue carries that event back so the application can reflect the result.',
  },
  {
    id: 'handwriting', title: 'Handwriting Generation', subtitle: 'Style-conditioned generative research', category: 'AI & ML', type: 'Graduate research',
    summary: 'Investigating how handwriting references can condition a generative model, from style embeddings through multi-GPU training.',
    problem: 'Generating readable text and preserving the appearance of a target handwriting style require different signals.',
    approach: 'A vision-transformer encoder represents handwriting style. A conditioned UNet learns denoising for generation. Experiments explore classification and contrastive objectives alongside distributed training and checkpointing.',
    outcome: 'The diffusion work is ongoing. In an earlier experiment with 400K handwriting samples across 399 styles, VAE and T5 models trained on four NVIDIA A5000 GPUs reached training losses of 0.10 and 0.68, respectively.',
    stack: ['PyTorch', 'ViT', 'Diffusion', 'UNet', 'DDP', 'SLURM'],
    diagram: ['Reference', 'Style encoder', 'UNet', 'Generation'],
    nodes: ['Use reference handwriting as the style input.', 'Encode visual features with a vision transformer.', 'Condition the denoising UNet on the style embedding.', 'Compare generated text against style references and inspect failure cases.'],
    challenge: 'Large experiments require tracking data quality, model shapes, GPU memory, and distributed training failures independently.',
  },
  {
    id: 'potholes', title: 'RoadWatch', subtitle: 'Cooperative road-hazard intelligence', category: 'AI & ML', type: 'Graduate research',
    summary: 'A computer vision pipeline that tracks the same pothole over multiple observations.',
    problem: 'Frame-by-frame object detection counts the same defect repeatedly as it moves through a dashcam sequence.',
    approach: 'YOLO detects potholes in frames. ByteTrack associates detections across frames and assigns persistent track IDs.',
    outcome: 'Implemented detection and tracking give repeated observations one persistent ID within a video sequence. Sharing hazards between vehicles and evaluating early warnings in CARLA are planned work.',
    stack: ['Python', 'PyTorch', 'YOLO', 'ByteTrack'],
    diagram: ['Dashcam', 'YOLO', 'ByteTrack', 'Defect ID'],
    nodes: ['Dashcam frames form the input sequence.', 'YOLO predicts pothole locations per frame.', 'ByteTrack associates detections across consecutive frames.', 'A persistent ID represents repeated observations of the same defect within the clip.'],
    challenge: 'A persistent ID within a clip is the implemented scope. Cross-vehicle association is a separate planned stage using location and shared hazard events.',
  },
  {
    id: 'cyclegan', title: 'Day-to-Night Translation', subtitle: 'CycleGAN for driving scenes', category: 'AI & ML', type: 'Computer vision project',
    summary: 'Investigated bidirectional day and night scene translation using unpaired BDD100K driving imagery.',
    problem: 'Matched day and night images of the same driving scenes are difficult to collect.',
    approach: 'CycleGAN learns translations in both directions from unpaired examples. Cycle-consistency encourages recovery of the input scene, while identity loss discourages unnecessary changes to target-domain inputs.',
    outcome: 'Explored how well unpaired translation preserves scene structure while changing illumination.',
    stack: ['PyTorch', 'CycleGAN', 'BDD100K', 'W&B', 'Gradio'],
    diagram: ['BDD100K', 'Day ↔ Night', 'Cycle loss', 'Compare'],
    nodes: ['Sample unpaired day and night driving scenes.', 'Train generators for both directions.', 'Use cycle-consistency and identity objectives to constrain changes.', 'Inspect translated scenes for structure preservation and artifacts.'],
    challenge: 'A convincing nighttime style can still hide or distort scene details. The evaluation considers both domain appearance and structural fidelity.',
  },
  {
    id: 'pintos', title: 'Pintos', subtitle: 'Operating system development', category: 'Systems Engineering', type: 'Systems project',
    summary: 'Implemented process and system-call behavior at the boundary between user programs and the kernel.',
    problem: 'User processes need arguments and kernel services, but their pointers cannot be assumed valid.',
    approach: 'Set up the user stack for argument passing, implemented system-call dispatch, and checked memory accesses at the user-to-kernel boundary.',
    outcome: 'Userspace programs could receive arguments and invoke kernel services through the implemented process and system-call paths.',
    stack: ['C', 'Operating Systems', 'Processes', 'System calls'],
    diagram: ['User process', 'Trap', 'Validate', 'Kernel'],
    nodes: ['Load arguments onto the user stack.', 'A user program enters the kernel with a system call.', 'Validate user memory references before accessing them.', 'Dispatch the operation and return control to userspace.'],
    challenge: 'Arguments and pointers originate in userspace. Validation belongs at the boundary before privileged code dereferences them.',
  },
]

export const secondaryProjects = [
  ['Apogee', 'Collaborative Godot rocket game with flight physics and an interactive interface.'],
  ['SideKick X', 'VS Code extension prototype for architecture visualization and conversational workflows.'],
  ['Formula One Analytics DB', 'PostgreSQL data modeling and analytical queries over racing data.'],
  ['Speaker Diarization', 'Speaker clustering with MFCCs, PCA, and Gaussian mixture models.'],
  ['Face Clustering', 'Computer vision experiments with embeddings and density-based clustering.'],
  ['Wordle', 'Java application using a trie for dictionary lookup.'],
  ['TinyGPT and Vision Transformer', 'Experiments with transformer architectures for text and vision.'],
]

export const engineeringNotes = [
  { title: 'When an existing worker is the better queue', summary: 'At DeltaX I evaluated RabbitMQ while building scheduled email delivery. The established campaign worker already provided a background execution path, so I reused it for scheduling instead of introducing a broker and another service to operate. In MovieVerse I made the opposite choice because the API and Python image workers had separate responsibilities and exchanged processing and completion events.' },
  { title: 'One cloud storage interface across two providers', summary: 'At DeltaX, I published a NuGet SDK that put AWS S3 and Azure Blob behind one interface. It replaced duplicate storage integrations across 20+ services and let applications switch providers without code changes.' },
  { title: 'Where to pause an agent workflow', summary: 'AgentQL pauses when it needs user clarification, before SQL generation. A stateful thread carries the conversation and allows execution to resume. Schema discovery gives generation concrete database context, and operation validation runs before execution.' },
]

export const skillGroups = [
  {
    name: 'Languages',
    description: 'C# for services, Python for research, and C for systems programming',
    color: 'blue',
    items: ['C#', 'Python', 'SQL', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript'],
  },
  {
    name: 'Backend',
    description: 'APIs, background jobs, and access control at DeltaX',
    color: 'violet',
    items: ['.NET', 'REST APIs', 'ASP.NET Core', 'Node.js', 'Flask', 'Background jobs', 'RBAC', 'Webhooks'],
  },
  {
    name: 'Data & Messaging',
    description: 'Commerce ingestion, plus queues and caching in MovieVerse',
    color: 'cyan',
    items: ['SQL Server', 'PostgreSQL', 'RabbitMQ', 'Redis', 'MongoDB', 'MySQL', 'SQLite'],
  },
  {
    name: 'Cloud & Delivery',
    description: 'An S3 and Azure storage SDK at DeltaX, plus AWS deployment for AgentQL',
    color: 'green',
    items: ['AWS S3', 'Docker', 'Azure Blob', 'AWS EC2', 'AWS Amplify', 'Nginx', 'Linux', 'GitHub Actions', 'CI/CD'],
  },
  {
    name: 'Applied AI',
    description: 'Agent workflows, computer vision, and multi-GPU training',
    color: 'pink',
    items: ['LangGraph', 'PyTorch', 'YOLO', 'PyTorch DDP', 'ByteTrack', 'ViT', 'UNet', 'VAE', 'T5', 'SLURM', 'CycleGAN'],
  },
  {
    name: 'Frontend',
    description: 'Vue interfaces at DeltaX and Mapbox visualization at Safety Knights',
    color: 'amber',
    items: ['Vue.js', 'React', 'Angular', 'Mapbox', 'HTML & CSS'],
  },
]

export const roleFits = [
  { id: 'api', name: 'Backend APIs', evidence: 'Built .NET email scheduling for 200+ client accounts and enterprise RBAC with 50+ granular permissions.', target: 'experience', role: 'deltax', label: 'DeltaX experience' },
  { id: 'async', name: 'Distributed workflows', evidence: 'Separated MovieVerse request handling and poster processing using two RabbitMQ queues and Python workers.', target: '/work/movieverse', label: 'MovieVerse case study' },
  { id: 'cloud', name: 'Cloud integrations', evidence: 'Published a NuGet SDK for AWS S3 and Azure Blob that replaced duplicate integrations across 20+ services.', target: 'experience', role: 'deltax', label: 'DeltaX experience' },
  { id: 'fullstack', name: 'Full-stack delivery', evidence: 'Built a configurable badge-rules engine and admin interface, and mapped 10K+ user locations with Mapbox.', target: 'experience', role: 'safety', label: 'Safety Knights experience' },
  { id: 'ai', name: 'Applied AI', evidence: 'Trained VAE and T5 models across four A5000 GPUs and built a stateful LangGraph SQL assistant.', target: 'projects', label: 'Applied AI projects' },
  { id: 'mlinfra', name: 'ML infrastructure', evidence: 'Built multi-GPU training workflows with PyTorch DDP and worked with checkpoints, SLURM, and training diagnostics.', target: 'research', label: 'Graduate research' },
  { id: 'algorithms', name: 'Algorithms', evidence: 'Solved 1,000+ problems across platforms and earned a 1398 peak rating on Codeforces.', target: 'coding', label: 'Competitive programming' },
]
