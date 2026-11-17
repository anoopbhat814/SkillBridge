interface Props {
  id: string;
  prompt: string;
  options: string[];
  selected?: number;
  onSelect: (index: number) => void;
}

export function QuestionCard({ id, prompt, options, selected, onSelect }: Props) {
  return (
    <fieldset>
      <legend>{prompt}</legend>
      {options.map((opt, i) => (
        <label key={i}>
          <input type="radio" name={id} checked={selected === i} onChange={() => onSelect(i)} />
          {opt}
        </label>
      ))}
    </fieldset>
  );
}
