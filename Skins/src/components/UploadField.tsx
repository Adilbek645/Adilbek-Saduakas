"use client";

import { useRef, useState } from "react";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/ui";

export default function UploadField({
  name,
  label,
  accept = "image/*",
  hint = "PNG, JPG, WEBP, GIF · до 6 МБ",
  multiple = false,
}: {
  name: string;
  label: string;
  accept?: string;
  hint?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; name: string; size: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <span className="mono-label">{label}</span>
      <div
        className="mt-1.5 cursor-pointer border border-dashed border-line bg-void/60 p-4 text-center transition hover:border-neon/70 hover:bg-neon/5"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (inputRef.current && event.dataTransfer.files.length > 0) {
            inputRef.current.files = event.dataTransfer.files;
            inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setError(null);
            const bad = files.find((file) => file.size > MAX_UPLOAD_BYTES);
            const wrongType = files.find((file) => !ALLOWED_MIME.includes(file.type));
            if (bad) {
              setError(`«${bad.name}» больше 6 МБ`);
              setPreviews([]);
              return;
            }
            if (wrongType) {
              setError(`Тип файла «${wrongType.name}» не поддерживается`);
              setPreviews([]);
              return;
            }
            setPreviews(
              files.map((file) => ({
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
              })),
            );
          }}
        />
        <p className="font-mono text-xs uppercase tracking-widest text-cyan">
          ⬆ {multiple ? "Выберите файлы" : "Выберите файл"} или перетащите сюда
        </p>
        <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-widest text-slate-500">{hint}</p>
      </div>

      {error ? (
        <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-widest text-[#ff98a2]">{error}</p>
      ) : null}

      {previews.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-3">
          {previews.map((file, index) => (
            <div key={`${file.name}-${index}`} className="border border-line bg-panel p-2">
              {/\.(png|jpe?g|webp|gif|avif)$/i.test(file.name) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt={file.name} className="h-20 w-28 object-cover" />
              ) : (
                <div className="grid h-20 w-28 place-items-center bg-void/70 text-2xl">
                  {/\.(mp4|webm|mov)$/i.test(file.name) ? "🎬" : "📎"}
                </div>
              )}
              <p className="mt-1 max-w-28 truncate font-mono text-[0.55rem] uppercase tracking-wider text-slate-400">
                {file.name}
              </p>
              <p className="font-mono text-[0.55rem] text-slate-600">{Math.round(file.size / 1024)} КБ</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
