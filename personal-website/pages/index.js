import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Link from 'next/link'
import utilStyles from '../styles/utils.module.css'
import styles from '../components/layout.module.css'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hi I'm Scott, I’m interested in space, robotics, crypto, and urban infrastructure.</p>
        <p> This is a personal website where I am having fun learning about how to build web apps. I don't have a lot of
        front-end experience, but I've challenged myself to work on this website every day for the next year and see
        where I end up. Hopefully I learn a lot and build some cool things in the process. Follow along with the links
        below and let me know if you have any ideas on what I should build!
        </p>
        <p>See what I'm building at my <a href="https://github.com/scottherlihy"> github</a> and see the bad jokes I'm making on <a href="https://twitter.com/________scott"> twitter</a>.</p>
      </section>
      {/* <Portfolio></Portfolio> */}

      <div className="grid">
        <Link href="/portfolio">
          <a className="card">
            <h3>Portfolio &rarr;</h3>
            <p>A vizualization I use to better understand my investment allocations.</p>
          </a>
        </Link>

        <Link href="/morning">
          <a className="card">
            <h3>Good Morning &rarr;</h3>
            <p>An in depth dashboard I created for my morning routine.</p>
          </a>
        </Link>

        <Link href="/rankings">
          <a className="card">
            <h3>Rankings Tracker&rarr;</h3>
            <p>Some UI practice and NFL predictions.</p>
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

      <div className={styles.rocket}>
        <img src="/images/rocket.png" alt="zoom"></img>
      </div>
    </Layout>
  )
}
