import { ComponentProps, FC } from 'react'

declare module 'next/link' {
  export interface LinkProps extends ComponentProps<'a'> {
    href: string
    prefetch?: boolean
  }
  
  const Link: FC<LinkProps>
  export default Link
}

declare module 'next/image' {
  export interface ImageProps extends ComponentProps<'img'> {
    src: string
    alt: string
    width: number
    height: number
    priority?: boolean
    className?: string
  }
  
  const Image: FC<ImageProps>
  export default Image
} 