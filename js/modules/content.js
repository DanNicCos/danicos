export const portfolioContent = {
    bio: {
        title: 'About Me',
        description: 'I am an AI Engineer specializing in building intelligent systems that augment human capabilities. With a deep passion for machine learning, natural language processing, and creative coding, I craft solutions that bridge the gap between cutting-edge AI research and real-world applications. My work focuses on creating intuitive, powerful tools that make advanced AI accessible and impactful.',
        links: [
            { name: 'GitHub', url: 'https://github.com/yourusername' },
            { name: 'Email', url: 'mailto:your.email@example.com' },
            { name: 'Substack', url: 'https://yoursubstack.substack.com' }
        ]
    },
    project1: {
        title: 'Project Alpha',
        description: 'Developed an automated machine learning platform that uses evolutionary algorithms and reinforcement learning to discover optimal neural network architectures. The system reduced model development time by 70% while achieving state-of-the-art performance on computer vision benchmarks. Built with PyTorch, Ray, and a custom distributed training infrastructure.'
    },
    project2: {
        title: 'Project Beta',
        description: 'Engineered a high-performance API serving layer for large language models, implementing advanced caching strategies, dynamic batching, and quantization techniques. Achieved sub-100ms latency for 95th percentile requests while serving millions of daily queries. Integrated with vector databases for retrieval-augmented generation capabilities.'
    },
    contact: {
        title: 'Get In Touch',
        description: 'I am always interested in discussing new AI challenges, research collaborations, or innovative applications of machine learning. Whether you are working on autonomous systems, natural language understanding, or creative AI applications, I would love to connect and explore how we can push the boundaries together.'
    },
    projects_overview: {
        title: 'Discover',
        type: 'project_list',
        projects: [
            { id: 'bio', name: 'Bio' },
            { id: 'project1', name: 'Project Alpha' },
            { id: 'project2', name: 'Project Beta' },
            { id: 'project3', name: 'Project Gamma' }
        ]
    },
    project3: {
        title: 'Project Gamma',
        description: 'Created a comprehensive framework for building multimodal AI assistants that seamlessly integrate vision, language, and audio understanding. The system employs transformer-based architectures with cross-modal attention mechanisms, enabling sophisticated reasoning across different input modalities. Successfully deployed in production environments handling complex document understanding and video analysis tasks.'
    }
};