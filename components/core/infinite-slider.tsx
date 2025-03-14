// "use client"

// import { useEffect, useRef, useState } from 'react'
// import { motion } from 'framer-motion'

// interface Props {
//   children: React.ReactNode
//   gap?: number
//   reverse?: boolean
// }

// export function InfiniteSlider({ children, gap = 16, reverse = false }: Props) {
//   const [width, setWidth] = useState(0)
//   const [isHovered, setIsHovered] = useState(false)
//   const containerRef = useRef<HTMLDivElement>(null)
//   const innerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     if (innerRef.current) {
//       setWidth(innerRef.current.offsetWidth)
//     }
//   }, [])

//   return (
//     <div
//       ref={containerRef}
//       className="relative flex overflow-hidden"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <motion.div
//         ref={innerRef}
//         className="flex gap-4 shrink-0"
//         animate={{
//           x: reverse ? [0, -width] : [-width, 0],
//         }}
//         transition={{
//           duration: 20,
//           ease: "linear",
//           repeat: Infinity,
//           pause: isHovered,
//         }}
//         style={{ gap }}
//       >
//         {children}
//       </motion.div>
//       <motion.div
//         className="flex gap-4 shrink-0"
//         animate={{
//           x: reverse ? [width, 0] : [0, width],
//         }}
//         transition={{
//           duration: 20,
//           ease: "linear",
//           repeat: Infinity,
//           pause: isHovered,
//         }}
//         style={{ gap }}
//       >
//         {children}
//       </motion.div>
//     </div>
//   )
// } 