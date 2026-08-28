// Knowledge dictionaries used by tools/analyze.mjs
// Maps raw detection signals to plain-language explanations.

export const LANGUAGES = {
  javascript: { label: 'JavaScript', speak: '网页脚本语言，让页面能动起来', color: '#f1e05a' },
  typescript: { label: 'TypeScript', speak: '带类型检查的 JavaScript，写大项目更稳', color: '#3178c6' },
  python:     { label: 'Python', speak: 'AI 领域第一语言，语法简单好读', color: '#3572A5' },
  go:         { label: 'Go', speak: 'Google 出品，擅长高并发服务', color: '#00ADD8' },
  rust:       { label: 'Rust', speak: '以安全和高性能著称的系统语言', color: '#dea584' },
  java:       { label: 'Java', speak: '企业级老牌语言，生态庞大', color: '#b07219' },
  c:          { label: 'C', speak: '贴近硬件的经典语言', color: '#555555' },
  'c++':      { label: 'C++', speak: '高性能计算与游戏引擎的常客', color: '#f34b7d' },
  'c#':       { label: 'C#', speak: '微软生态主力语言', color: '#178600' },
  ruby:       { label: 'Ruby', speak: '以优雅著称的脚本语言', color: '#701516' },
  php:        { label: 'PHP', speak: '建站常青树， WordPress 底层', color: '#4F5D95' },
  swift:      { label: 'Swift', speak: '苹果系应用开发语言', color: '#F05138' },
  kotlin:     { label: 'Kotlin', speak: '安卓官方推荐语言', color: '#A97BFF' },
  html:       { label: 'HTML', speak: '网页骨架标记语言', color: '#e34c26' },
  css:        { label: 'CSS', speak: '网页样式语言', color: '#563d7c' },
  shell:      { label: 'Shell', speak: '命令行脚本，粘合各种工具', color: '#89e051' },
  vue:        { label: 'Vue', speak: '渐进式前端框架', color: '#41b883' },
};

export const FRAMEWORKS = {
  // JS/TS ecosystem
  'package.json': [
    { dep: 'react',       label: 'React',       speak: '前端组件化框架，界面拆成一块块积木', category: '前端' },
    { dep: 'vue',         label: 'Vue',         speak: '轻量前端框架，上手快', category: '前端' },
    { dep: 'next',        label: 'Next.js',     speak: 'React 全栈框架，服务端渲染', category: '前端' },
    { dep: 'nuxt',        label: 'Nuxt',        speak: 'Vue 全栈框架', category: '前端' },
    { dep: 'vite',        label: 'Vite',        speak: '新一代前端构建工具，快', category: '构建' },
    { dep: 'webpack',     label: 'webpack',     speak: '老牌前端打包器', category: '构建' },
    { dep: 'express',     label: 'Express',     speak: 'Node 后端小框架', category: '后端' },
    { dep: 'koa',         label: 'Koa',         speak: 'Express 作者的下一代后端框架', category: '后端' },
    { dep: 'fastify',     label: 'Fastify',     speak: '高性能 Node 后端框架', category: '后端' },
    { dep: 'nestjs',      label: 'NestJS',      speak: '企业级 Node 后端框架', category: '后端' },
    { dep: 'electron',    label: 'Electron',    speak: '用网页技术做桌面软件', category: '桌面' },
    { dep: 'chart.js',    label: 'Chart.js',    speak: '轻量图表库', category: '可视化' },
    { dep: 'd3',          label: 'D3.js',       speak: '数据可视化之王', category: '可视化' },
    { dep: 'jest',        label: 'Jest',        speak: '单元测试框架', category: '测试' },
    { dep: 'vitest',      label: 'Vitest',      speak: 'Vite 生态测试框架', category: '测试' },
    { dep: 'eslint',      label: 'ESLint',      speak: '代码风格检查器', category: '质量' },
    { dep: 'typescript',  label: 'TypeScript',  speak: 'JavaScript 的类型增强版', category: '语言' },
  ],
  'requirements.txt': [
    { dep: 'torch',       label: 'PyTorch',     speak: '深度学习框架，AI 研究首选', category: 'AI' },
    { dep: 'torchvision', label: 'torchvision',speak: 'PyTorch 官方视觉工具集', category: 'AI' },
    { dep: 'tensorflow',  label: 'TensorFlow',  speak: 'Google 深度学习框架', category: 'AI' },
    { dep: 'transformers',label: 'Transformers',speak: 'Hugging Face 模型库，NLP 事实标准', category: 'AI' },
    { dep: 'diffusers',   label: 'Diffusers',   speak: '扩散模型库，文生图核心', category: 'AI' },
    { dep: 'accelerate',  label: 'Accelerate',  speak: '多卡/分布式训练加速器', category: 'AI' },
    { dep: 'numpy',       label: 'NumPy',       speak: '科学计算基石', category: '科学' },
    { dep: 'pandas',      label: 'pandas',      speak: '表格数据处理神器', category: '科学' },
    { dep: 'scipy',       label: 'SciPy',       speak: '科学计算工具箱', category: '科学' },
    { dep: 'scikit-learn',label: 'scikit-learn',speak: '传统机器学习全家桶', category: 'AI' },
    { ext: true, dep: 'jupyter',  label: 'Jupyter',  speak: '交互式笔记本，做实验用', category: '工具' },
    { ext: true, dep: 'opencv',  label: 'OpenCV',   speak: '计算机视觉万能工具', category: '视觉' },
    { ext: true, dep: 'flask',   label: 'Flask',    speak: 'Python 微型 Web 框架', category: '后端' },
    { ext: true, dep: 'fastapi', label: 'FastAPI',  speak: '现代 Python 后端框架', category: '后端' },
    { ext: true, dep: 'django',  label: 'Django',   speak: '全家桶式 Python Web 框架', category: '后端' },
    { ext: true, dep: 'requests',label: 'requests', speak: 'Python HTTP 请求库', category: '工具' },
    { ext: true, dep: 'pytest',  label: 'pytest',   speak: 'Python 测试框架', category: '测试' },
  ],
  'pyproject.toml': 'requirements.txt',
  'go.mod': [
    { dep: 'gin-gonic',   label: 'Gin',         speak: 'Go 最流行 Web 框架', category: '后端' },
    { dep: 'echo',        label: 'Echo',        speak: 'Go 高性能 Web 框架', category: '后端' },
    { dep: 'cobra',       label: 'Cobra',       speak: 'Go 命令行应用框架', category: '工具' },
  ],
  'Cargo.toml': [
    { dep: 'tokio',       label: 'tokio',       speak: 'Rust 异步运行时', category: '异步' },
    { dep: 'serde',       label: 'serde',       speak: 'Rust 序列化框架', category: '序列化' },
    { dep: 'clap',        label: 'clap',        speak: 'Rust 命令行参数解析', category: '工具' },
    { dep: 'axum',        label: 'axum',        speak: 'Rust Web 框架', category: '后端' },
    { dep: 'wasm-bindgen',label: 'wasm-bindgen',speak: 'Rust 编译到 WebAssembly', category: 'WebAssembly' },
  ],
  'pom.xml': [
    { dep: 'spring-boot', label: 'Spring Boot', speak: 'Java 企业级框架', category: '后端' },
  ],
};

// File-name signals for projects without manifests
export const FILE_SIGNALS = {
  'Dockerfile':          { label: 'Docker',        speak: '把应用打包成容器，到处能跑', category: '部署' },
  'docker-compose.yml':  { label: 'Docker Compose',speak: '一条命令启动整套服务', category: '部署' },
  '.github/workflows':   { label: 'GitHub Actions',speak: '仓库内置自动化流水线', category: 'CI/CD' },
  'Makefile':            { label: 'Make',          speak: '老牌任务编排工具', category: '构建' },
  '.eslintrc':           { label: 'ESLint',        speak: '代码风格检查', category: '质量' },
  '.gitignore':          { label: '.gitignore',    speak: '声明哪些文件不进版本库', category: 'Git' },
  'README.md':           { label: 'README',        speak: '项目说明书，第一个该看的文件', category: '文档' },
};

// What entry files usually mean
export const ENTRY_HINTS = {
  'main.py':     'Python 程序主入口',
  'app.py':      'Web 应用入口',
  'index.js':    'Node 程序入口',
  'index.ts':    'TypeScript 程序入口',
  'main.go':     'Go 程序入口',
  'main.rs':     'Rust 程序入口',
  '__init__.py': 'Python 包初始化文件',
  'cli.py':      '命令行工具入口',
  'server.js':   '服务器启动文件',
  'train.py':    '模型训练脚本',
  'infer.py':    '推理/预测脚本',
  'setup.py':    'Python 安装配置',
  'conftest.py': 'pytest 测试配置',
};

// Design-pattern / architecture signals found in source text
export const PATTERN_SIGNALS = [
  { re: /\bnew\s+\w+Promise\b|\bPromise\b[\s\S]{0,40}\bthen\b/i, pattern: 'Promise 异步模式', speak: '先答应后兑现：发起耗时操作不干等，完成后回调', severity: 'common' },
  { re: /class\s+\w+\s+extends\s+/i, pattern: '继承体系', speak: '子类复用父类代码，模板方法思路', severity: 'common' },
  { re: /\basync\s+function\b|\bawait\b/, pattern: 'async/await', speak: '用同步写法处理异步，代码更好读', severity: 'common' },
  { re: /\bexport\s+(default\s+)?function\b|\bmodule\.exports\b/, pattern: '模块化导出', speak: '功能拆成模块互相引用', severity: 'common' },
  { re: /\bon\(['"]\w+['"]\s*,|\.addEventListener\(/i, pattern: '事件驱动', speak: '「有事叫我」：注册回调等事件发生', severity: 'common' },
  { re: /\binterface\s+\w+\s*\{|\btype\s+\w+\s*=/, pattern: '接口约定', speak: 'TypeScript 定义数据形状，契约先行', severity: 'common' },
  { re: /\btry\s*\{[\s\S]{0,200}\bcatch\s*\(/i, pattern: '异常捕获', speak: '出错不崩溃，兜住处理', severity: 'common' },
  { re: /\bmiddleware\b/i, pattern: '中间件', speak: '请求像流水线过安检，每站处理一点', severity: 'common' },
  { re: /\bRouter\b|\brouter\./i, pattern: '路由分发', speak: 'URL 映射到处理函数', severity: 'common' },
  { re: /\bclass\s+\w*(Factory|Builder|Adapter|Observer|Singleton|Strategy)\w*/i, pattern: '经典 GoF 模式', speak: '用名字就能看出意图的面向对象套路', severity: 'notable' },
  { re: /@Component\b|@Injectable\b|@Service\b/i, pattern: '依赖注入', speak: '对象不自己造依赖，由容器分配', severity: 'notable' },
  { re: /\buse[A-Z]\w*\(/ , pattern: 'React Hooks', speak: '函数组件里管理状态的钩子', severity: 'common' },
  { re: /createStore\b|useDispatch\b|useSelector\b/, pattern: '状态管理', speak: '全局状态集中管理，UI 只负责显示', severity: 'notable' },
  { re: /\bGraphQL\b|\bgraphql\b/, pattern: 'GraphQL', speak: '按需取数据的新式 API 风格', severity: 'notable' },
  { re: /\bObservable\b|subscribe\(/i, pattern: '观察者/响应式流', speak: '数据像水流，订阅了就能收到', severity: 'notable' },
];

// Category rules: ordered, first match wins.
// keywords are tested against "owner/repo name description tags topics" (lowercased).
export const CATEGORY_RULES = [
  {
    id: 'llm',
    label: '大模型 / LLM',
    speak: '语言大模型与相关训练、推理工具',
    keywords: ['llm', 'gpt', 'llama', 'mistral', 'qwen', 'deepseek', 'chatglm', '大模型', '语言模型', 'transformer', 'tokeniz', 'inference server', 'vllm', 'text-generation'],
  },
  {
    id: 'vision',
    label: '计算机视觉',
    speak: '图像识别、目标检测、分割与生成',
    keywords: ['vision', 'cv', 'object detection', 'yolo', 'segmentation', '图像', '视觉', 'ocr', 'diffusion', 'stable-diffusion', '文生图', 'image generation', 'gan', 'super resolution'],
  },
  {
    id: 'audio',
    label: '语音 / 音频',
    speak: '语音识别、合成与音乐生成',
    keywords: ['speech', 'asr', 'tts', 'whisper', 'voice', 'audio', '语音', '音乐生成', 'music generation', 'sound'],
  },
  {
    id: 'agents',
    label: 'AI 智能体',
    speak: '能自主规划调用工具的 AI 程序',
    keywords: ['agent', 'autogpt', 'copilot', 'tool use', 'function call', 'mcp', '智能体', 'workflow automation', 'crewai', 'langgraph'],
  },
  {
    id: 'mlops',
    label: '训练 / 部署框架',
    speak: '模型训练、加速与生产部署的基础设施',
    keywords: ['training framework', 'distributed', 'deep learning framework', 'pytorch', 'tensorflow', 'inference', 'quantiz', 'compiler', 'onnx', 'tensorrt', 'ml ops', 'mlops', 'serving'],
  },
  {
    id: 'rag',
    label: 'RAG / 知识库',
    speak: '检索增强生成与向量知识库',
    keywords: ['rag', 'retrieval', 'vector database', 'embedding', '知识库', 'chroma', 'milvus', 'qdrant', 'pinecone', 'faiss', 'langchain', 'llamaindex'],
  },
  {
    id: 'learning',
    label: '教程 / 学习资源',
    speak: '课程、笔记、面试题与示例集',
    keywords: ['tutorial', 'course', 'notes', '面试', '学习', 'roadmap', 'awesome', 'guide', 'handbook', 'cookbook', 'examples', 'interview', '101', '入门'],
  },
  {
    id: 'tools',
    label: '开发工具',
    speak: '提升开发效率的实用工具',
    keywords: ['cli', 'toolkit', 'utility', 'boilerplate', 'template', 'starter', '脚手架', '工具'],
  },
  {
    id: 'web',
    label: 'Web 应用',
    speak: '网站、前端与全栈项目',
    keywords: ['web', 'frontend', 'react', 'vue', 'next', 'nuxt', 'dashboard', 'admin', 'website', 'landing', 'blog', 'fullstack'],
  },
  {
    id: 'other',
    label: '其他',
    speak: '暂未归类的好项目',
    keywords: [],
  },
];

// ---------- 适用场景 / 竞品 / 改造方向 / 踩坑知识库 ----------
// 按项目画像（分类 + 关键词）匹配，static 他没有 LLM，靠规则给出「够用」的答案。

export const SCENARIOS = [
  { cat: 'llm', when: '想低成本跑/部署开源大模型，或学习推理引擎内部实现', not: '想训练自己的大模型（应去看训练框架）' },
  { cat: 'vision', when: '做图像识别、文生图、目标检测类应用或 demo', not: '纯文本任务（直接用 LLM 类项目）' },
  { cat: 'audio', when: '语音转文字、语音合成、音乐生成类需求', not: '实时通话场景（需额外工程化）' },
  { cat: 'agents', when: '想让 AI 自动完成多步任务、编排工作流', not: '单轮问答（普通 chat 应用即可）' },
  { cat: 'mlops', when: '要微调/部署模型，或搭建训练流水线', not: '只想调用现成 API（无需本地框架）' },
  { cat: 'rag', when: '想让自己的文档/知识库支持 AI 问答', not: '数据量极小（直接贴给大模型更简单）' },
  { cat: 'learning', when: '系统学习某个方向的完整知识体系', not: '想直接找生产可用的工具（看对应分类）' },
  { cat: 'tools', when: '日常开发提效，拿来做脚手架或小工具', not: '重业务逻辑的系统（需要完整框架）' },
  { cat: 'web', when: '参考真实的网站/应用代码组织方式', not: 'AI 模型相关需求' },
  { cat: 'other', when: '按 README 描述评估是否能解决手头问题', not: '—' },
];

export const COMPETITORS = {
  'Significant-Gravitas/AutoGPT': [
    { name: 'MetaGPT', repo: 'FoundationAgents/MetaGPT', edge: '多角色协作分工更像软件公司' },
    { name: 'LangChain', repo: 'langchain-ai/langchain', edge: '生态最大，编排积木最全' },
    { name: 'CrewAI', repo: 'crewAIInc/crewAI', edge: '上手简单，角色定义直观' },
  ],
  'AUTOMATIC1111/stable-diffusion-webui': [
    { name: 'ComfyUI', repo: 'Comfy-Org/ComfyUI', edge: '节点式编排，工作流可复用分享' },
    { name: 'Fooocus', repo: 'lllyasviel/Fooocus', edge: '开箱即用，追求极简' },
    { name: 'InvokeAI', repo: 'invoke-ai/InvokeAI', edge: '专业画布与画师工作流' },
  ],
  'ggml-org/llama.cpp': [
    { name: 'vLLM', repo: 'vllm-project/vllm', edge: '高吞吐服务化，PagedAttention' },
    { name: 'Ollama', repo: 'ollama/ollama', edge: '封装更友好，模型一键拉取' },
    { name: 'text-generation-inference', repo: 'huggingface/text-generation-inference', edge: 'HF 官方推理服务栈' },
  ],
  'openai/whisper': [
    { name: 'faster-whisper', repo: 'SYSTRAN/faster-whisper', edge: 'CTranslate2 加速，快 4 倍' },
    { name: 'FunASR', repo: 'modelscope/FunASR', edge: '中文场景效果更好' },
    { name: 'whisper.cpp', repo: 'ggml-org/whisper.cpp', edge: 'C++ 移植，CPU/嵌入式可跑' },
  ],
  'microsoft/ML-For-Beginners': [
    { name: 'ML-Intro-for-Engineers', repo: 'microsoft/ML-For-Beginners', edge: '同系列姊妹课程' },
    { name: 'PRML', repo: 'ctgk/PRML', edge: '偏理论推导' },
    { name: 'd2l-zh', repo: 'd2l-ai/d2l-zh', edge: '动手学深度学习，中文友好' },
  ],
  'vllm-project/vllm': [
    { name: 'llama.cpp', repo: 'ggml-org/llama.cpp', edge: 'CPU/边缘设备友好，量化强' },
    { name: 'TGI', repo: 'huggingface/text-generation-inference', edge: 'HF 生态集成深' },
    { name: 'SGLang', repo: 'sgl-project/sglang', edge: '结构化输出与缓存激进优化' },
  ],
};

// 通用竞品兜底：按 category 给同类代表项目
export const CATEGORY_PEERS = {
  llm: [
    { name: 'llama.cpp', repo: 'ggml-org/llama.cpp', edge: '本地推理代表' },
    { name: 'vLLM', repo: 'vllm-project/vllm', edge: '服务化推理代表' },
    { name: 'Ollama', repo: 'ollama/ollama', edge: '易用性代表' },
  ],
  vision: [
    { name: 'ComfyUI', repo: 'Comfy-Org/ComfyUI', edge: '节点式工作流代表' },
    { name: 'YOLOv8', repo: 'ultralytics/ultralytics', edge: '目标检测代表' },
    { name: 'Real-ESRGAN', repo: 'xinntao/Real-ESRGAN', edge: '超分辨率代表' },
  ],
  audio: [
    { name: 'whisper', repo: 'openai/whisper', edge: '语音识别基线' },
    { name: 'Bert-VITS2', repo: 'fishaudio/Bert-VITS2', edge: '语音合成代表' },
    { name: 'GPT-SoVITS', repo: 'RVC-Boss/GPT-SoVITS', edge: '少样本语音克隆' },
  ],
  agents: [
    { name: 'LangChain', repo: 'langchain-ai/langchain', edge: '编排生态最大' },
    { name: 'AutoGPT', repo: 'Significant-Gravitas/AutoGPT', edge: '自主智能体先驱' },
    { name: 'CrewAI', repo: 'crewAIInc/crewAI', edge: '多角色协作' },
  ],
  mlops: [
    { name: 'DeepSpeed', repo: 'microsoft/DeepSpeed', edge: '大模型分布式训练' },
    { name: 'Ray', repo: 'ray-project/ray', edge: '分布式计算全家桶' },
    { name: 'ONNX Runtime', repo: 'microsoft/onnxruntime', edge: '跨平台推理加速' },
  ],
  rag: [
    { name: 'LangChain', repo: 'langchain-ai/langchain', edge: 'RAG 编排事实标准' },
    { name: 'LlamaIndex', repo: 'run-llama/llama_index', edge: '数据连接器最全' },
    { name: 'Dify', repo: 'langgenius/dify', edge: '可视化 RAG 平台' },
  ],
};

// 改造方向（按 category），difficulty: 入门 / 进阶 / 硬核
export const REWORK_IDEAS = {
  llm: [
    { idea: '接入自己的模型文件（GGUF/安全张量），跑通一条完整推理链路', difficulty: '入门' },
    { idea: '加一个 Web API 层（FastAPI），把它变成可调用的推理服务', difficulty: '进阶' },
    { idea: '实现自定义量化/裁剪，在低端显卡上压出可接受的速度', difficulty: '硬核' },
  ],
  vision: [
    { idea: '换一个自定义数据集微调，认识训练-评估完整闭环', difficulty: '入门' },
    { idea: '加批量推理 + 任务队列，把它包成图片处理服务', difficulty: '进阶' },
    { idea: '做多模型级联（检测→生成→后处理），搭一条 pipeline', difficulty: '硬核' },
  ],
  audio: [
    { idea: '用自己的录音测试识别效果，观察语言/口音鲁棒性', difficulty: '入门' },
    { idea: '加流式识别（VAD 切分 + 增量解码），支持实时字幕', difficulty: '进阶' },
    { idea: '蒸馏/量化到端侧，在手机上跑起来', difficulty: '硬核' },
  ],
  agents: [
    { idea: '给它加一个自定义工具（比如查天气），看它学会调用', difficulty: '入门' },
    { idea: '改造提示词与记忆结构，让它完成一个多步骤真实任务', difficulty: '进阶' },
    { idea: '做多智能体协作（规划者+执行者+审查者）解决一个复杂问题', difficulty: '硬核' },
  ],
  mlops: [
    { idea: '跑通官方示例训练任务，读懂配置文件每个字段', difficulty: '入门' },
    { idea: '对接自己的数据集做一次微调并导出部署', difficulty: '进阶' },
    { idea: '做多节点分布式训练，分析通信瓶颈', difficulty: '硬核' },
  ],
  rag: [
    { idea: '喂入自己的文档，调通「入库→检索→回答」全链路', difficulty: '入门' },
    { idea: '换/调检索器（BM25 vs 向量），对比召回质量', difficulty: '进阶' },
    { idea: '加重排（rerank）+ 混合检索，把回答质量再抬一档', difficulty: '硬核' },
  ],
  learning: [
    { idea: '按课程顺序做完前 3 章练习，写学习笔记', difficulty: '入门' },
    { idea: '把课程里的算法独立复现一遍（不看参考代码）', difficulty: '进阶' },
    { idea: '选一个章节做成中文教程/视频分享出去', difficulty: '进阶' },
  ],
  web: [
    { idea: '本地跑起来，改一个组件样式看热更新', difficulty: '入门' },
    { idea: '加一个新页面/接口，走一遍完整数据流', difficulty: '进阶' },
    { idea: '做性能优化（首屏/打包体积），前后对比量化', difficulty: '硬核' },
  ],
};

// 高频踩坑清单（按 category），plain 语言
export const PITFALLS = {
  common: [
    { pit: '环境不隔离：直接在系统 Python/node 里装依赖，装到一半互相打架', fix: '先建 venv / 用 nvm 固定版本，再装依赖' },
    { pit: 'CUDA/驱动不匹配：torch 装了 CUDA 12 版本但驱动只支持 11', fix: '先 nvidia-smi 看驱动支持的上限，再选对应版本安装' },
    { pit: '模型文件放错目录：程序默认去 ./models 找，你下到了下载文件夹', fix: '先跑一次看报错里的路径，把文件挪过去' },
  ],
  llm: [
    { pit: '显存不够直接 OOM：模型全精度加载，显卡撑不住', fix: '用量化版本（4bit/8bit）或换小一号模型' },
    { pit: '上下文拉满导致推理极慢', fix: '控制输入长度，长文档走 RAG 而非硬塞' },
    { pit: '并发一上来就崩：单进程扛不住', fix: '上 vLLM 类服务框架或加队列限流' },
  ],
  vision: [
    { pit: '显存爆在反而是预处理：图片没缩放直接进模型', fix: '预处理里 resize 到模型期望的尺寸' },
    { pit: '采样器参数抄别人的导致输出全噪点', fix: '用官方 README 给的推荐参数起步，再微调' },
    { pit: '模型与权重版本不匹配：旧代码配新权重', fix: '锁定 release 版本，代码和权重同版本' },
  ],
  audio: [
    { pit: '采样率不对：模型要 16kHz，你喂了 44.1kHz 音乐文件', fix: '先重采样到 16kHz 单声道' },
    { pit: '长音频一次全喂导致显存爆', fix: '按 30 秒切块识别再拼结果' },
    { pit: '中文识别错字多', fix: '打开对应语言 token，或换中文优化模型' },
  ],
  agents: [
    { pit: '工具描述写得含糊，模型一直调不对工具', fix: '工具描述写清输入输出格式，配一两个例子' },
    { pit: '没有循环上限，agent 卡死在自我对话', fix: '设最大步数与超时，超限强制终止' },
    { pit: 'API key 硬编码进了代码还提交了', fix: '用环境变量/.env，并检查 git 历史' },
  ],
  mlops: [
    { pit: 'batch size 抄别人的，自己卡直接 OOM', fix: '从小的开始试，逐步加倍找上限' },
    { pit: '数据路径写在代码里，换机器就崩', fix: '路径进配置文件/环境变量' },
    { pit: '忘了固定随机种子，结果无法复现', fix: 'seed 写进配置并记录版本号' },
  ],
  rag: [
    { pit: '文档没切块直接塞，检索质量稀烂', fix: '按段落/固定 token 数切块，保留标题上下文' },
    { pit: 'embedding 模型和问答模型语言不一致', fix: '中文语料用中文/多语 embedding 模型' },
    { pit: '只看 top-1 检索结果，答非所问', fix: 'top-k 调到 3~5 并加相似度阈值' },
  ],
};

// 依赖解释补充（detectFrameworks 之外常见的重量级依赖）
export const DEP_NOTES = {
  'grpc': '高性能远程调用框架，服务间通信',
  'protobuf': '谷歌的二进制序列化格式，快且省流量',
  'redis': '内存数据库，当缓存/队列用',
  'celery': 'Python 分布式任务队列',
  'docker': '容器化运行环境',
  'cmake': 'C/C++ 构建系统生成器',
  'numpy': '科学计算基石',
  'pillow': 'Python 图像处理库',
  'onnx': '跨框架模型交换格式',
  'tensorrt': 'NVIDIA 官方推理加速库',
  'gguf': 'llama.cpp 生态的模型权重格式',
  'safetensors': '更安全的模型权重格式（相比 pickle）',
  'opencl': 'GPU 通用计算开放标准',
  'cuda': 'NVIDIA GPU 并行计算平台',
  'metal': '苹果 GPU 计算接口',
  'vulkan': '跨平台图形/计算接口',
};

export function classifyProject(p) {
  // name/repo/tags are curated signals; API-fetched descriptions can contain
  // misleading words ("the vision of accessible AI"), so they rank lower.
  const strongText = [
    p.repo || '',
    p.name || '',
    (p.tags || []).join(' '),
    (p.topics || []).join(' '),
  ].join(' ').toLowerCase();
  const fullText = strongText + ' ' + (p.description || '').toLowerCase();
  // word-boundary match for short/ambiguous latin keywords (e.g. "vision"
  // must not match "supervision", "cv" must not match "opencv" false-friend hits)
  const wordish = (text, kw) => {
    if (/^[\u4e00-\u9fff]+$/.test(kw)) return text.includes(kw); // CJK: substring
    const re = new RegExp(`(^|[^a-z0-9])${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`);
    return re.test(text);
  };
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => wordish(strongText, k))) return rule.id;
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => wordish(fullText, k))) return rule.id;
  }
  return 'other';
}

// Fill in missing plain-language fields for a project entry.
export function enrichProject(p) {
  const cat = CATEGORY_RULES.find(c => c.id === (p.category || classifyProject(p)));
  return {
    category: cat ? cat.id : 'other',
    category_label: cat ? cat.label : '其他',
    category_speak: cat ? cat.speak : '',
    ...p,
  };
}
