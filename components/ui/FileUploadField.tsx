'use client';

interface FileUploadFieldProps {
  label: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

export function FileUploadField({ label, accept, file, onChange }: FileUploadFieldProps) {
  return (
    <label className="file-drop">
      <span className="file-drop-icon">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13V4M10 4L6.5 7.5M10 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 14v1.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex-1 truncate">{file ? file.name : label}</span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="hidden"
      />
    </label>
  );
}
