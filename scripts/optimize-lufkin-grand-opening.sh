#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${1:-public}"
OUTPUT_DIR="$ROOT_DIR/lufkin-grand-opening"
GALLERY_DIR="$OUTPUT_DIR/gallery"

DESKTOP_SOURCE="$ROOT_DIR/ErOfLufkin-Event-4k.mov"
MOBILE_SOURCE="$ROOT_DIR/ErOfLufkin-Event-Vertical.mov"

mkdir -p "$OUTPUT_DIR" "$GALLERY_DIR"

if [[ ! -f "$DESKTOP_SOURCE" ]]; then
  echo "Missing source video: $DESKTOP_SOURCE" >&2
  exit 1
fi

if [[ ! -f "$MOBILE_SOURCE" ]]; then
  echo "Missing source video: $MOBILE_SOURCE" >&2
  exit 1
fi

echo "Optimizing desktop video..."
ffmpeg -y \
  -i "$DESKTOP_SOURCE" \
  -vf "scale='min(1600,iw)':-2,format=yuv420p" \
  -c:v libx264 \
  -preset slow \
  -crf 24 \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  "$OUTPUT_DIR/lufkin-grand-opening-desktop.mp4"

echo "Optimizing mobile video..."
ffmpeg -y \
  -i "$MOBILE_SOURCE" \
  -vf "scale='min(900,iw)':-2,format=yuv420p" \
  -c:v libx264 \
  -preset slow \
  -crf 25 \
  -movflags +faststart \
  -c:a aac \
  -b:a 96k \
  "$OUTPUT_DIR/lufkin-grand-opening-mobile.mp4"

echo "Extracting hero frames..."
TMP_DESKTOP_FRAME="$(mktemp "$OUTPUT_DIR/lufkin-hero-desktop-XXXXXX.png")"
TMP_MOBILE_FRAME="$(mktemp "$OUTPUT_DIR/lufkin-hero-mobile-XXXXXX.png")"

ffmpeg -y \
  -ss 00:00:08 \
  -i "$DESKTOP_SOURCE" \
  -frames:v 1 \
  -vf "scale='min(1600,iw)':-2" \
  "$TMP_DESKTOP_FRAME"

ffmpeg -y \
  -ss 00:00:08 \
  -i "$MOBILE_SOURCE" \
  -frames:v 1 \
  -vf "scale='min(900,iw)':-2" \
  "$TMP_MOBILE_FRAME"

magick "$TMP_DESKTOP_FRAME" -quality 75 "$OUTPUT_DIR/lufkin-hero-desktop.webp"
magick "$TMP_MOBILE_FRAME" -quality 75 "$OUTPUT_DIR/lufkin-hero-mobile.webp"
rm -f "$TMP_DESKTOP_FRAME" "$TMP_MOBILE_FRAME"

echo "Optimizing gallery images..."
shopt -s nullglob
for input in "$ROOT_DIR"/ErofLufkin-FraceMedia*.png; do
  filename="$(basename "$input" .png)"
  magick "$input" -resize "1800x1800>" -quality 75 "$GALLERY_DIR/$filename.webp"
done

echo "Done. Optimized assets are in $OUTPUT_DIR"
