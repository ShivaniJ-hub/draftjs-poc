import React from 'react'
import StyleButton from './StyleButton';

const INLINE_STYLES = [
    { label: "Bold", style: "BOLD" },
    { label: "Italic", style: "ITALIC" },
    { label: "Underline", style: "UNDERLINE" },
  ];

function InlineStyleControls(props) {
    const currentStyle = props.editorState.getCurrentInlineStyle();
  
    return (
      <div className="RichEditor-controls">
        {INLINE_STYLES.map(type => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        ))}
      </div>
    );
}

export default InlineStyleControls;