import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

export default function HomeButton() {
    return (
        <Link href="/">
            <a>
                <Image
                    priority
                    src="/images/home.png"
                    className={utilStyles.homeButton}
                    height={25}
                    width={25}
                    alt={"home"} />
            </a>
        </Link>
    )
}
