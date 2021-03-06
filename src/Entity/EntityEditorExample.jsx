import React from 'react';
import {styles} from './style';
import {
    convertFromRaw,
    convertToRaw,
    CompositeDecorator,
    Editor,
    EditorState,
  } from 'draft-js';

  const rawContent = {
    blocks: [
      {
        text: (
          'This is an "immutable" entity: Superman. Deleting any ' +
          'characters will delete the entire entity. Adding characters ' +
          'will remove the entity from the range.'
        ),
        type: 'unstyled',
        entityRanges: [{offset: 31, length: 8, key: 'first'}],
      },
      {
        text: '',
        type: 'unstyled',
      },
      {
        text: (
          'This is a "mutable" entity: Batman. Characters may be added ' +
          'and removed.'
        ),
        type: 'unstyled',
        entityRanges: [{offset: 28, length: 6, key: 'second'}],
      },
      {
        text: '',
        type: 'unstyled',
      },
      {
        text: (
          'This is a "segmented" entity: Green Lantern. Deleting any ' +
          'characters will delete the current "segment" from the range. ' +
          'Adding characters will remove the entire entity from the range.'
        ),
        type: 'unstyled',
        entityRanges: [{offset: 30, length: 13, key: 'third'}],
      },
    ],

    entityMap: {
      first: {
        type: 'TOKEN',
        mutability: 'IMMUTABLE',
      },
      second: {
        type: 'TOKEN',
        mutability: 'MUTABLE',
      },
      third: {
        type: 'TOKEN',
        mutability: 'SEGMENTED',
      },
    },
  };

  export default class EntityEditorExample extends React.Component {
    constructor(props) {
      super(props);

      const decorator = new CompositeDecorator([
        {
          strategy: getEntityStrategy('IMMUTABLE'),
          component: TokenSpan,
        },
        {
          strategy: getEntityStrategy('MUTABLE'),
          component: TokenSpan,
        },
        {
          strategy: getEntityStrategy('SEGMENTED'),
          component: TokenSpan,
        },
      ]);

      const blocks = convertFromRaw(rawContent);

      this.state = {
        editorState: EditorState.createWithContent(blocks, decorator),
      };

      this.focus = () => this.refs.editor.focus();
      this.onChange = (editorState) => this.setState({editorState});
      this.logState = () => {
        const content = this.state.editorState.getCurrentContent();
        console.log(convertToRaw(content));
      };
    }

    render() {
      return (
        <div style={styles.root}>
          <div style={styles.editor} onClick={this.focus}>
            <Editor
              editorState={this.state.editorState}
              onChange={this.onChange}
              placeholder="Enter some text..."
              ref="editor"
            />
          </div>
          <input
            onClick={this.logState}
            style={styles.button}
            type="button"
            value="Log State"
          />
        </div>
      );
    }
  }

  function getEntityStrategy(mutability) {
    return function(contentBlock, callback, contentState) {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          if (entityKey === null) {
            return false;
          }
          return contentState.getEntity(entityKey).getMutability() === mutability;
        },
        callback
      );
    };
  }

  function getDecoratedStyle(mutability) {
    switch (mutability) {
      case 'IMMUTABLE': return styles.immutable;
      case 'MUTABLE': return styles.mutable;
      case 'SEGMENTED': return styles.segmented;
      default: return null;
    }
  }

  const TokenSpan = (props) => {
    const style = getDecoratedStyle(
      props.contentState.getEntity(props.entityKey).getMutability()
    );
    return (
      <span data-offset-key={props.offsetkey} style={style}>
        {props.children}
      </span>
    );
  };