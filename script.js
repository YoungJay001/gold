class TreasureHunter {
    constructor() {
        this.searchCount = 0;
        this.totalValue = 0;
        this.records = [];
        this.isSearching = false;
        
        this.qualityRanges = {
            green: { min: 5000, max: 8000, color: 'quality-green', spins: 1 },
            blue: { min: 8000, max: 20000, color: 'quality-blue', spins: 1.5 },
            purple: { min: 20000, max: 80000, color: 'quality-purple', spins: 2 },
            gold: { min: 100000, max: 300000, color: 'quality-gold', spins: 2.5 },
            red: { min: 800000, max: 2000000, color: 'quality-red', spins: 3 }
        };

        this.qualityNames = ['green', 'blue', 'purple', 'gold', 'red'];
        this.qualityWeights = [0.3, 0.3, 0.2, 0.15, 0.05]; // 概率权重

        this.init();
    }

    init() {
        this.createGrid();
        this.bindEvents();
        this.updateDisplay();
        this.initMemeExpression();
    }

    createGrid() {
        const container = document.getElementById('gridContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const item = document.createElement('div');
            item.className = 'grid-item empty';
            item.dataset.index = i;
            container.appendChild(item);
        }
    }

    bindEvents() {
        document.getElementById('searchBtn').addEventListener('click', () => this.startSearch());
        document.getElementById('recordsBtn').addEventListener('click', () => this.showRecords());
        document.getElementById('closeRecords').addEventListener('click', () => this.hideRecords());
        
        // 点击模态框外部关闭
        document.getElementById('recordsModal').addEventListener('click', (e) => {
            if (e.target.id === 'recordsModal') {
                this.hideRecords();
            }
        });
    }

    async startSearch() {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.searchCount++;
        this.updateSearchTitle();
        
        // 清空网格
        this.createGrid();
        
        // 模拟搜索过程
        setTimeout(async () => {
            await this.generateItems();
            this.isSearching = false;
        }, 1000);
    }

    async generateItems() {
        const items = [];
        const itemCount = 4; // 固定开4个物品
        
        for (let i = 0; i < itemCount; i++) {
            const quality = this.getRandomQuality();
            const value = this.getRandomValue(quality);
            const imagePath = this.getRandomItemImage(quality);
            const item = {
                quality,
                value,
                position: i,
                imagePath
            };
            items.push(item);
        }

        await this.displayItemsSequentially(items);
        this.addToRecords(items);
        this.updateTotalValue();
    }

    getRandomQuality() {
        const rand = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < this.qualityWeights.length; i++) {
            cumulative += this.qualityWeights[i];
            if (rand <= cumulative) {
                return this.qualityNames[i];
            }
        }
        return 'green';
    }

    getRandomValue(quality) {
        const range = this.qualityRanges[quality];
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }

    getRandomItemImage(quality) {
        const imageMap = {
            green: [
                'image/lv/15020010005.png',
                'image/lv/15020010012.png',
                'image/lv/15040010012.png',
                'image/lv/15060010012.png',
                'image/lv/15060080001.png',
                'image/lv/15060080006.png',
                'image/lv/15080050020.png',
                'image/lv/15080050110.png'
            ],
            blue: [
                'image/lan/15020040002.png',
                'image/lan/15030040010.png',
                'image/lan/15060010006.png',
                'image/lan/15060010007.png',
                'image/lan/15060080013.png',
                'image/lan/15080050023.png',
                'image/lan/15080050021.png',
                'image/lan/15080050073.png',
                'image/lan/15080050074.png',
                'image/lan/15080050075.png',
                'image/lan/15080050116.png',
                'image/lan/15200000073.png'
            ],
            purple: [
                'image/zi/15040010014.png',
                'image/zi/15030050011.png',
                'image/zi/15020010024.png',
                'image/zi/15030040007.png',
                'image/zi/15020050001.png',
                'image/zi/15020050006.png',
                'image/zi/15030040006.png',
                'image/zi/15030040005.png',
                'image/zi/15080050001.png',
                'image/zi/15080050036.png',
                'image/zi/15080050064.png',
                'image/zi/15080050045.png',
                'image/zi/15080050091.png',
                'image/zi/15080050117.png',
                'image/zi/15080050136.png'
            ],
            gold: [
                'image/jin/15030050006.png',
                'image/jin/15080050009.png',
                'image/jin/15080050015.png',
                'image/jin/15080050034.png',
                'image/jin/15080050115.png',
                'image/jin/15080050135.png',
                'image/jin/15080050129.png',
                'image/jin/15080050132.png',
                'image/jin/15080050137.png',
                'image/jin/15080050164.png',
                'image/jin/15080050143.png',
                'image/jin/15200000068.png'
            ],
            red: [
                'image/hong/15030050017.png',
                'image/hong/15030050002.png',
                'image/hong/15080050014.png',
                'image/hong/15080050006.png',
                'image/hong/15080050122.png',
                'image/hong/15080050131.png',
                'image/hong/15080050142.png',
                'image/hong/15200000071.png'
            ]
        };
        
        const images = imageMap[quality] || imageMap.green;
        return images[Math.floor(Math.random() * images.length)];
    }

    displayItems(items) {
        items.forEach((item, index) => {
            const gridItem = document.querySelector(`[data-index="${index}"]`);
            if (gridItem) {
                gridItem.className = `grid-item ${this.qualityRanges[item.quality].color}`;
                gridItem.innerHTML = `
                    <img src="${item.imagePath}" alt="物品" class="item-image">
                    <div class="item-value">${this.formatValue(item.value)}</div>
                `;
                
                // 添加加载动画
                this.addLoadingAnimation(gridItem, item.quality);
            }
        });
    }

    async displayItemsSequentially(items) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const gridItem = document.querySelector(`[data-index="${i}"]`);
            
            if (gridItem) {
                // 先显示加载动画
                gridItem.className = `grid-item loading`;
                
                // 根据品质设置不同的加载时间
                const spins = this.qualityRanges[item.quality].spins;
                const duration = spins * 1000; // 毫秒
                
                // 等待加载完成
                await new Promise(resolve => {
                    setTimeout(() => {
                        gridItem.className = `grid-item ${this.qualityRanges[item.quality].color}`;
                        gridItem.innerHTML = `
                            <img src="${item.imagePath}" alt="物品" class="item-image">
                            <div class="item-value">${this.formatValue(item.value)}</div>
                        `;
                        
                        // 更新表情包
                        this.updateMemeExpression(item.quality);
                        
                        resolve();
                    }, duration);
                });
            }
        }
    }

    addLoadingAnimation(element, quality) {
        element.classList.add('loading');
        const spins = this.qualityRanges[quality].spins;
        const duration = spins * 1000; // 毫秒
        
        setTimeout(() => {
            element.classList.remove('loading');
        }, duration);
    }

    formatValue(value) {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
        }
        return value.toString();
    }

    addToRecords(items) {
        const record = {
            searchNumber: this.searchCount,
            items: items,
            totalValue: items.reduce((sum, item) => sum + item.value, 0),
            timestamp: new Date().toLocaleString()
        };
        this.records.push(record);
        this.totalValue += record.totalValue;
    }

    updateTotalValue() {
        document.getElementById('totalValue').textContent = `价值【${this.formatValue(this.totalValue)}】`;
    }

    updateSearchTitle() {
        document.getElementById('searchTitle').textContent = `第${this.searchCount}次搜索【大保险箱】`;
    }

    showRecords() {
        const modal = document.getElementById('recordsModal');
        const list = document.getElementById('recordsList');
        
        // 统计所有物品
        const itemCounts = {};
        this.records.forEach(record => {
            record.items.forEach(item => {
                const key = item.imagePath;
                if (!itemCounts[key]) {
                    itemCounts[key] = {
                        imagePath: item.imagePath,
                        quality: item.quality,
                        count: 0
                    };
                }
                itemCounts[key].count++;
            });
        });
        
        // 转换为数组并排序
        const itemsArray = Object.values(itemCounts).sort((a, b) => b.count - a.count);
        
        // 生成网格显示
        list.innerHTML = itemsArray.map(item => `
            <div class="record-item ${this.qualityRanges[item.quality].color}">
                <div class="item-icon">
                    <img src="${item.imagePath}" alt="物品">
                </div>
                <div class="item-quantity">${item.count}次</div>
            </div>
        `).join('');
        
        // 更新统计信息
        document.getElementById('totalSearchCount').textContent = this.searchCount;
        document.getElementById('recordsTotalValue').textContent = this.formatValue(this.totalValue);
        
        modal.style.display = 'block';
    }

    hideRecords() {
        document.getElementById('recordsModal').style.display = 'none';
    }

    updateDisplay() {
        this.updateTotalValue();
        this.updateSearchTitle();
    }

    initMemeExpression() {
        const memeImage = document.querySelector('.meme-image');
        if (memeImage) {
            memeImage.src = 'image/expression/hong.jpg';
        }
    }

    updateMemeExpression(quality) {
        const memeImage = document.querySelector('.meme-image');
        const expressionMap = {
            green: 'image/expression/lv.jpg',
            blue: 'image/expression/lan.jpg',
            purple: 'image/expression/zi.jpg',
            gold: 'image/expression/jin.jpg',
            red: 'image/expression/hong.jpg'
        };
        
        const expressionPath = expressionMap[quality];
        if (expressionPath && memeImage) {
            // 清除之前的定时器
            if (this.memeResetTimer) {
                clearTimeout(this.memeResetTimer);
            }
            
            memeImage.src = expressionPath;
            
            // 3秒后恢复默认表情
            this.memeResetTimer = setTimeout(() => {
                memeImage.src = 'image/expression/hong.jpg';
            }, 3000);
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TreasureHunter();
}); 