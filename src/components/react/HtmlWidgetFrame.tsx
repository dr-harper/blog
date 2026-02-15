interface Props {
  src: string;
  height?: string;
  title: string;
}

export default function HtmlWidgetFrame({ src, height = '480px', title }: Props) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={src}
        title={title}
        style={{ width: '100%', height, border: 'none' }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
