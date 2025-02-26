// Statistics.jsx
import React, { useMemo, useState } from 'react';
import iconStatistics from '/statistics.webp';
import ChartBar from './Charts/ChartBar';
import ChartLine from './Charts/ChartLine';
import ChartDoughnut from './Charts/ChartDoughnut';
import ChartPie from './Charts/ChartPie';
import ChartBarI from './ChartsInteractions/ChartBarI';
import ChartPieI from './ChartsInteractions/ChartPieI';
import ChartLineI from './ChartsInteractions/ChartLineI';
import ChartDoughnutI from './ChartsInteractions/ChartDoughnutI';
import decrypt from './../Js/decrypt';
import GenderAgeChart from './Charts/GenderAgeChart';

const Statistics = ({ currentUserData }) => {
  const { paid, statistics, posts } = currentUserData;
  const [activeTab, setActiveTab] = useState('visits');
  const chartItems = useMemo(() => {
    if (!statistics || !Array.isArray(statistics)) return [];
    return statistics.map((stat) => ({
      label: stat.n || stat.id || 'Usuario',
      visits: stat.v?.c || 0, // visitas
      firstVisit: stat.c || 'Fecha desconocida',
      lastVisit: stat.v?.l || 'Sin última visita',
      image: stat.p || '',
      age: stat.b || 0,
      gender: stat.g || '',
      telf: stat.t || '',
      province: stat.pr || '',
    }));
  }, [statistics]);

  // Total de interacciones: likes, comentarios y compartidos
  const interactionsData = useMemo(() => {
    if (!posts) return { totalLikes: 0, totalComments: 0, totalShares: 0 };
    return posts.reduce(
      (acc, post) => {
        acc.totalLikes += post.likes ? post.likes.length : 0;
        acc.totalComments += post.comments ? post.comments.length : 0;
        acc.totalShares += post.shared ? post.shared.length : 0;
        return acc;
      },
      { totalLikes: 0, totalComments: 0, totalShares: 0 }
    );
  }, [posts]);

  // Top de usuarios que comentan
  const topCommenters = useMemo(() => {
    if (!posts) return [];
    const counts = {};
    posts.forEach((post) => {
      if (post.comments) {
        post.comments.forEach((comment) => {
          const user = decrypt(comment.n);
          counts[user] = (counts[user] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  // Interacciones por publicación
  const interactionsPerPost = useMemo(() => {
    if (!posts) return { labels: [], data: [] };
    const labels = posts.map((_, i) => `Post ${i + 1}`);
    const data = posts.map(
      (post) =>
        (post.likes ? post.likes.length : 0) +
        (post.comments ? post.comments.length : 0) +
        (post.shared ? post.shared.length : 0)
    );
    return { labels, data };
  }, [posts]);

  // Preparamos los datasets para cada gráfico
  const interactionsBarData = {
    labels: ['Likes', 'Comentarios', 'Compartidos'],
    datasets: [
      {
        label: 'Interacciones Totales',
        data: [
          interactionsData.totalLikes,
          interactionsData.totalComments,
          interactionsData.totalShares,
        ],
        backgroundColor: [
          'rgba(255,99,132,0.4)',
          'rgba(54,162,235,0.4)',
          'rgba(255,206,86,0.4)',
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54,162,235,1)',
          'rgba(255,206,86,1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topCommentersData = {
    labels: topCommenters.map((item) => item.user),
    datasets: [
      {
        label: 'Comentarios por Usuario',
        data: topCommenters.map((item) => item.count),
        backgroundColor: [
          'rgba(255,99,132,0.4)',
          'rgba(54,162,235,0.4)',
          'rgba(255,206,86,0.4)',
          'rgba(75,192,192,0.4)',
          'rgba(153,102,255,0.4)',
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54,162,235,1)',
          'rgba(255,206,86,1)',
          'rgba(75,192,192,1)',
          'rgba(153,102,255,1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const interactionsLineData = {
    labels: interactionsPerPost.labels,
    datasets: [
      {
        label: 'Interacciones por Publicación',
        data: interactionsPerPost.data,
        fill: false,
        borderColor: 'rgba(116,39,116,1)',
      },
    ],
  };

  const interactionsDoughnutData = {
    labels: ['Likes', 'Comentarios', 'Compartidos'],
    datasets: [
      {
        data: [
          interactionsData.totalLikes,
          interactionsData.totalComments,
          interactionsData.totalShares,
        ],
        backgroundColor: [
          'rgba(255,99,132,0.4)',
          'rgba(54,162,235,0.4)',
          'rgba(255,206,86,0.4)',
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54,162,235,1)',
          'rgba(255,206,86,1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <section className="stats-section">
      <h2>Estadísticas</h2>
      {paid && paid.i_p ? (
        <>
          <div className="tabs">
            <button
              className={activeTab === 'visits' ? 'active' : ''}
              onClick={() => setActiveTab('visits')}
            >
              Visitas
            </button>
            <button
              className={activeTab === 'interactions' ? 'active' : ''}
              onClick={() => setActiveTab('interactions')}
            >
              Interacciones
            </button>
          </div>
          <div className="stats-section__item">
            {activeTab === 'visits' && (
              <>
                <ChartBar chartItems={chartItems} />
                <ChartLine chartItems={chartItems} />
                <ChartDoughnut chartItems={chartItems} />
                <ChartPie chartItems={chartItems} />
                <GenderAgeChart chartItems={chartItems} />
              </>
            )}
            {activeTab === 'interactions' && (
              <>
                <ChartBarI chartData={interactionsBarData} title="Interacciones Totales" />
                <ChartPieI chartData={topCommentersData} title="Top Comentadores" />
                <ChartLineI chartData={interactionsLineData} title="Interacciones por Publicación" />
                <ChartDoughnutI chartData={interactionsDoughnutData} title="Proporción de Reacciones" />

              </>
            )}
          </div>
        </>
      ) : (
        <div className="charts">
          <p>
            Visualiza gráficos, analiza interacciones en tiempo real y accede a
            reportes detallados para optimizar tu estrategia.
          </p>
          <img
            id="width-icon-statistics"
            src={iconStatistics}
            alt="Estadísticas"
          />
        </div>
      )}
    </section>
  );
};

export default React.memo(Statistics);
