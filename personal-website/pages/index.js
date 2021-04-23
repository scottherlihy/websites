import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Hi I'm Scott, I’m interested in space, robotics, crypto, and urban infrastructure.</p>
        <p>See what I'm building at my <a href="https://github.com/scottherlihy/scottherlihy"> github</a> and see the bad jokes I'm making on <a href="https://twitter.com/________scott"> twitter</a> </p>

        <p>
          (This is a new site, much more to come soon)
        </p>
      </section>
    </Layout>
  )
}