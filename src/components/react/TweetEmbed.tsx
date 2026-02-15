interface Props {
  tweetUrl: string;
  author: string;
  handle: string;
  content: string;
}

export default function TweetEmbed({ tweetUrl, author, handle, content }: Props) {
  return (
    <blockquote className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-5 not-prose">
      <p className="text-gray-800 mb-3 whitespace-pre-line">{content}</p>
      <footer className="text-sm text-gray-500">
        &mdash; {author} (<a href={tweetUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">{handle}</a>)
        {' '}
        <a href={tweetUrl} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
          View on Twitter
        </a>
      </footer>
    </blockquote>
  );
}
