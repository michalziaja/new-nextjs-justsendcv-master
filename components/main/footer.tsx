import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900/50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Logo JustSend.cv"
                width={40}
                height={40}
              />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-purple-500 dark:to-cyan-500 text-transparent bg-clip-text">
                JustSend.cv
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Zmień sposób, w jaki szukasz pracy dzięki naszej platformie opartej na AI.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-500 hover:text-cyan-500 dark:hover:text-cyan-400">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Produkt</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Funkcje
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Cennik
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Rozszerzenie przeglądarki
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Plan rozwoju
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Zasoby</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Dokumentacja
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Poradniki
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Wsparcie
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Firma</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  O nas
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Kariera
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-cyan-500 dark:hover:text-cyan-400"
                >
                  Warunki korzystania
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} JustSend.cv. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </div>
    </footer>
  )
}

