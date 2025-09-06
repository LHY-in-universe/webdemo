/**
 * 国际化管理器
 * 处理多语言切换和文本翻译
 */

class I18nManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.getBrowserLanguage();
        this.translations = {};
        this.originalTexts = {}; // 存储原始HTML中的中文文本
        this.isLoading = false; // 防止重复加载
        this.loadTimeout = null; // 防抖定时器
        
        // 设置HTML lang属性
        document.documentElement.lang = this.currentLanguage === 'zh' ? 'zh-CN' : 'en';
        
        // 确保DOM加载完成后再保存原始文本和加载翻译
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.saveOriginalTexts();
                this.loadTranslations();
            });
        } else {
            this.saveOriginalTexts(); // 保存原始文本
            this.loadTranslations();
        }
        
        this.setupEventListeners();
    }

    // 获取存储的语言
    getStoredLanguage() {
        return localStorage.getItem('language');
    }

    // 获取浏览器语言
    getBrowserLanguage() {
        // 强制返回英文，确保界面显示英文
        return 'en';
    }

    // 保存原始HTML中的文本
    saveOriginalTexts() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                this.originalTexts[key] = element.value;
            } else if (element.hasAttribute('placeholder')) {
                this.originalTexts[key] = element.placeholder;
            } else if (element.hasAttribute('title')) {
                this.originalTexts[key] = element.title;
            } else {
                this.originalTexts[key] = element.textContent;
            }
        });

        // 保存页面标题
        const titleKey = document.documentElement.getAttribute('data-i18n-title');
        if (titleKey) {
            this.originalTexts[titleKey] = document.title;
        }

        // 保存placeholder原始文本
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            this.originalTexts[key] = element.placeholder;
        });
    }

    // 加载翻译文件
    async loadTranslations() {
        // 清除之前的防抖定时器
        if (this.loadTimeout) {
            clearTimeout(this.loadTimeout);
        }
        
        // 防止重复加载
        if (this.isLoading) {
            return;
        }
        
        // 如果是中文，直接使用原始文本，不需要加载翻译文件
        if (this.currentLanguage === 'zh') {
            this.applyTranslations();
            this.updateLanguageToggle();
            return;
        }
        
        // 使用防抖机制，延迟100ms执行
        return new Promise((resolve) => {
            this.loadTimeout = setTimeout(async () => {
                if (this.isLoading) {
                    resolve();
                    return;
                }
                
                this.isLoading = true;
                await this._doLoadTranslations();
                resolve();
            }, 100);
        });
    }
    
    async _doLoadTranslations() {

        try {
            // 使用相对路径，从当前页面位置计算
            const basePath = window.location.pathname.includes('/ai/pages/') 
                ? '../../shared/i18n/' 
                : window.location.pathname.includes('/p2pai/pages/')
                ? '../../shared/i18n/'
                : window.location.pathname.includes('/edgeai/pages/')
                ? '../../shared/i18n/'
                : window.location.pathname.includes('/blockchain/pages/') 
                ? '../../shared/i18n/'
                : window.location.pathname.includes('/crypto/pages/')
                ? '../../shared/i18n/'
                : window.location.pathname.includes('/homepage/')
                ? '../shared/i18n/'
                : './shared/i18n/';
            
            const response = await fetch(`${basePath}${this.currentLanguage}.json?v=20250905`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.translations = await response.json();
        } catch (error) {
            this.translations = this.getDefaultTranslations();
        } finally {
            this.isLoading = false;
        }
        this.applyTranslations();
        this.updateLanguageToggle();
    }

    // 获取默认翻译（中文）
    getDefaultTranslations() {
        return {
            // 通用
            "common": {
                "home": "主页",
                "login": "登录",
                "logout": "登出",
                "register": "注册",
                "submit": "提交",
                "cancel": "取消",
                "confirm": "确认",
                "save": "保存",
                "delete": "删除",
                "edit": "编辑",
                "create": "创建",
                "loading": "加载中...",
                "error": "错误",
                "success": "成功",
                "warning": "警告",
                "info": "信息"
            },
            
            // 主页
            "homepage": {
                "title": "联邦学习与多方计算平台",
                "subtitle": "安全、高效的分布式机器学习解决方案",
                "modules": {
                    "ai": {
                        "title": "AI模型训练",
                        "description": "联邦学习与多方计算训练"
                    },
                    "blockchain": {
                        "title": "区块链金融",
                        "description": "去中心化金融应用"
                    },
                    "crypto": {
                        "title": "密钥加密",
                        "description": "安全密码学工具"
                    }
                }
            },

            // AI模块
            "ai": {
                "title": "AI模型训练",
                "userType": {
                    "title": "选择用户类型",
                    "client": "客户端",
                    "server": "总服务器",
                    "clientDesc": "参与联邦训练，保护本地数据隐私",
                    "serverDesc": "管理全局模型，协调训练过程"
                },
                "login": {
                    "title": "登录",
                    "username": "用户名",
                    "password": "密码",
                    "loginBtn": "登录",
                    "registerBtn": "注册账号"
                },
                "dashboard": {
                    "client": {
                        "title": "客户端控制面板",
                        "localTraining": "Local Training",
                        "federatedTraining": "Distribution Learning Training",
                        "localDesc": "Train models on local devices",
                        "federatedDesc": "Participate in distribution learning"
                    },
                    "server": {
                        "title": "Server Control Panel",
                        "requests": "Training Requests",
                        "monitoring": "Network Monitoring",
                        "management": "Client Management"
                    }
                },
                "training": {
                    "local": {
                        "title": "Local Training",
                        "modelConfig": "Model Configuration",
                        "datasetUpload": "Upload Dataset",
                        "startTraining": "Start Training"
                    },
                    "federated": {
                        "title": "Federated Training Mode Selection",
                        "standard": "Single Model Node",
                "mpc": "MPC Decentralized Model Node",
                        "standardDesc": "View global training progress and detailed information",
                        "mpcDesc": "View only your own training progress with stronger privacy protection"
                    }
                }
            },

            // 区块链模块
            "blockchain": {
                "title": "区块链金融",
                "wallet": "钱包",
                "transaction": "交易",
                "mining": "挖矿",
                "contracts": "智能合约"
            },

            // 密钥加密模块
            "crypto": {
                "title": "密钥加密",
                "keyGeneration": "密钥生成",
                "encryption": "加密",
                "decryption": "解密",
                "signature": "数字签名"
            }
        };
    }

    // 切换语言
    async switchLanguage(language) {
        if (this.currentLanguage === language) return;
        
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        // 更新HTML lang属性
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
        
        await this.loadTranslations();
        
        // 触发语言变更事件
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }

    // 应用翻译
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            let text;
            
            // 如果是中文，使用原始文本；如果是其他语言，使用翻译
            if (this.currentLanguage === 'zh') {
                text = this.originalTexts[key];
            } else {
                text = this.getTranslation(key);
            }
            
            if (text) {
                if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                    element.value = text;
                } else if (element.hasAttribute('placeholder')) {
                    element.placeholder = text;
                } else if (element.hasAttribute('title')) {
                    element.title = text;
                } else {
                    element.textContent = text;
                }
            }
        });

        // 处理placeholder翻译
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            let text;
            
            if (this.currentLanguage === 'zh') {
                // 使用原始中文文本（如果存在）或当前placeholder
                text = this.originalTexts[key] || element.placeholder;
            } else {
                text = this.getTranslation(key);
            }
            
            if (text) {
                element.placeholder = text;
                console.log(`Translated placeholder ${key}: ${text}`);
            }
        });

        // 更新页面标题
        const titleKey = document.documentElement.getAttribute('data-i18n-title');
        if (titleKey) {
            let title;
            if (this.currentLanguage === 'zh') {
                title = this.originalTexts[titleKey];
            } else {
                title = this.getTranslation(titleKey);
            }
            if (title) {
                document.title = title;
            }
        }
    }

    // 获取翻译文本
    getTranslation(key) {
        const keys = key.split('.');
        let translation = this.translations;
        
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return typeof translation === 'string' ? translation : null;
    }

    // 更新语言切换按钮
    updateLanguageToggle() {
        const toggleButtons = document.querySelectorAll('.language-toggle');
        toggleButtons.forEach(button => {
            button.textContent = this.currentLanguage === 'zh' ? 'EN' : '中文';
            button.title = this.currentLanguage === 'zh' ? 'Switch to English' : '切换到中文';
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.language-toggle')) {
                const newLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
                this.switchLanguage(newLanguage);
            }
        });
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // 检查是否为中文
    isChineseLanguage() {
        return this.currentLanguage === 'zh';
    }
}

// 创建全局国际化管理器实例（单例模式）
if (!window.i18nManager) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.i18nManager = new I18nManager();
        });
    } else {
        window.i18nManager = new I18nManager();
    }
}