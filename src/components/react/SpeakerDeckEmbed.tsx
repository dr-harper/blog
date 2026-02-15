interface Props {
  dataId: string;
  ratio?: string;
}

export default function SpeakerDeckEmbed({ dataId, ratio = '1.77777777777778' }: Props) {
  return (
    <div className="my-6">
      <div
        style={{ position: 'relative', paddingBottom: `${(1 / parseFloat(ratio)) * 100}%`, height: 0, overflow: 'hidden' }}
      >
        <iframe
          src={`https://speakerdeck.com/player/${dataId}`}
          title="SpeakerDeck presentation"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
