import React from 'react';
import { BookOpen } from 'lucide-react';
import { getLucideIconByName, isEmojiString } from '../data/subjectIcons';

interface SubjectIconProps {
  icon?: string;
  className?: string;
  emojiClassName?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({
  icon,
  className = 'w-6 h-6',
  emojiClassName
}) => {
  const iconStr = (icon || 'BookOpen').trim();

  // 1. Check if it's an emoji
  if (isEmojiString(iconStr)) {
    return (
      <span
        role="img"
        aria-label="subject-icon"
        className={`inline-flex items-center justify-center select-none leading-none ${emojiClassName || 'text-xl'}`}
      >
        {iconStr}
      </span>
    );
  }

  // 2. Look up in Lucide icon map
  const LucideComp = getLucideIconByName(iconStr);
  if (LucideComp) {
    return <LucideComp className={className} />;
  }

  // 3. Fallback
  return <BookOpen className={className} />;
};

export default SubjectIcon;
