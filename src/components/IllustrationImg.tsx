"use client";

import { useState, CSSProperties, ReactNode } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** 画像がない場合に表示するCSSフォールバック */
  fallback: ReactNode;
}

/**
 * イラスト画像があれば表示し、404/エラーの場合はfallbackを描画する。
 * public/illustrations/ に画像を置くだけで自動切り替えされる。
 */
export default function IllustrationImg({
  src,
  alt = "",
  className,
  style,
  fallback,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
