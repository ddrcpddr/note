import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { noteTypes } from '../shared/defaults.js';
import './styles.css';

function App() {
  const [categories, setCategories] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('正在连接本地数据库...');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [healthResult, categoriesResult] = await Promise.all([
          fetch('/api/health').then((result) => result.json()),
          fetch('/api/categories').then((result) => result.json())
        ]);

        setStatus(healthResult.ok ? '本地数据库已连接' : '数据库状态未知');
        setCategories(categoriesResult.categories || []);
      } catch (error) {
        setStatus('暂时无法连接本地服务');
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (activeCategory) params.set('category', activeCategory);

    fetch(`/api/notes?${params.toString()}`)
      .then((result) => result.json())
      .then((data) => setNotes(data.notes || []))
      .catch(() => setNotes([]));
  }, [search, activeCategory]);

  const activeCategoryName = useMemo(() => {
    return categories.find((category) => category.id === activeCategory)?.name || '全部记录';
  }, [activeCategory, categories]);

  return (
    <main className="app-shell">
      <header className="top-area">
        <p className="eyebrow">家庭生活记录</p>
        <h1>今天家里发生了什么？</h1>
        <div className="search-box">
          <span>搜索</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="标题、正文、家电、发票、医院..."
          />
        </div>
      </header>

      <section className="category-strip" aria-label="分类筛选">
        <button
          className={!activeCategory ? 'category-chip active' : 'category-chip'}
          onClick={() => setActiveCategory('')}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={activeCategory === category.id ? 'category-chip active' : 'category-chip'}
            onClick={() => setActiveCategory(category.id)}
            style={{ '--chip-color': category.color }}
          >
            {category.name}
          </button>
        ))}
      </section>

      <section className="timeline-head">
        <div>
          <h2>{activeCategoryName}</h2>
          <p>{status}</p>
        </div>
        <span>{notes.length} 条</span>
      </section>

      <section className="timeline">
        {notes.length === 0 ? (
          <div className="empty-card">
            <h3>还没有记录</h3>
            <p>第一阶段已完成项目骨架和数据库连接。下一阶段会接入新建记录、详情和编辑。</p>
            <div className="type-grid">
              {noteTypes.map((type) => (
                <span key={type.id}>{type.name}</span>
              ))}
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <article key={note.id} className="note-card">
              <div className="note-meta">
                <span style={{ color: note.categoryColor }}>{note.categoryName}</span>
                <time>{note.occurredAt || note.createdAt}</time>
              </div>
              <h3>{note.title}</h3>
              <p>{note.summary}</p>
            </article>
          ))
        )}
      </section>

      <button className="new-note-button" type="button">新建</button>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
