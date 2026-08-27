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
