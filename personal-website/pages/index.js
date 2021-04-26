import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import utilStyles from '../styles/utils.module.css'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hi I'm Scott, I’m interested in space, robotics, crypto, and urban infrastructure.</p>
        <p>See what I'm building at my <a href="https://github.com/scottherlihy"> github</a> and see the bad jokes I'm making on <a href="https://twitter.com/________scott"> twitter</a>.</p>
      </section>
      {/* <Portfolio></Portfolio> */}

      <div className="grid">
        <Link href="/morning">
          <a className="card">
            <h3>Good Morning &rarr;</h3>
            <p>An in depth dashboard I created for my morning routine.</p>
          </a>
        </Link>

        <Link href="/portfolio">
          <a className="card">
            <h3>Portfolio &rarr;</h3>
            <p>A vizualization I use to better understand my investment allocations.</p>
          </a>
        </Link>

        <style jsx>{`
        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 2rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

      `}</style>
      </div>
    </Layout>
  )
}