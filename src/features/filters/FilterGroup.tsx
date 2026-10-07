import type { IFilterGroupProps } from '../../types/filter.types';
import Accordion from '../../components/Accordion';
import Checkbox from '../../components/Checkbox';

const FilterGroup = <T extends string>({
  title,
  options,
  selected,
  onChange,
}: IFilterGroupProps<T>) => {
  return (
    <Accordion title={title} count={selected.length ? selected.length : undefined}>
      <div className="space-y-0.5">
        {options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={selected.includes(option.value)}
            onChange={() => onChange(option.value)}
            count={option.count}
          />
        ))}
      </div>
    </Accordion>
  );
};

export default FilterGroup;