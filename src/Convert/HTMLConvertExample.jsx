import React from 'react';
import {styles} from './style';
import {
    convertFromHTML,
    convertToRaw,
    CompositeDecorator,
    Editor,
    EditorState,
    ContentState,
    Modifier
  } from 'draft-js';
export default class HTMLConvertExample extends React.Component {
        constructor(props) {
          super(props);

          const decorator = new CompositeDecorator([
            {
              strategy: findLinkEntities,
              component: Link,
            },
            {
              strategy: findImageEntities,
              component: Image,
            },
          ]);

          const sampleMarkup =
            '<b>Bold text</b>, <i>Italic text</i><br/ ><br />' +
            '<a href="http://www.facebook.com">Example link</a><br /><br/ >' +
            '<img src="media.png" height="112" width="200" />';

          const blocksFromHTML = convertFromHTML(sampleMarkup);
          const state = ContentState.createFromBlockArray(
            blocksFromHTML.contentBlocks,
            blocksFromHTML.entityMap,
          );

          this.state = {
            editorState: EditorState.createWithContent(
              state,
              decorator,
            ),
          };

          this.focus = () => this.refs.editor.focus();
          this.onChange = (editorState) => this.setState({editorState});
          this.logState = () => {
            const content = this.state.editorState.getCurrentContent();
            console.log(convertToRaw(content));
          };
          this.modifiers = (e) => {
            e.preventDefault();
            const contentState = this.state.editorState.getCurrentContent();
            const selectionState = this.state.editorState.getSelection();
            const newContentState = Modifier.applyEntity(contentState,
              selectionState,
              null)
            this.onChange(EditorState.createWithContent(newContentState,decorator))
          };
        }

        render() {
          return (
            <div style={styles.root}>
              <div style={{marginBottom: 10}}>
                Sample HTML converted into Draft content state
              </div>
              <div style={styles.editor} onClick={this.focus}>
                <Editor
                  editorState={this.state.editorState}
                  onChange={this.onChange}
                  ref="editor"
                />
              </div>
              <input
                onClick={this.logState}
                style={styles.button}
                type="button"
                value="Log State"
              />
              <input
                onClick={this.modifiers}
                style={styles.button}
                type="button"
                value="Modify"
              />
            </div>
          );
        }
      }

      function findLinkEntities(contentBlock, callback, contentState) {
        contentBlock.findEntityRanges(
          (character) => {
            const entityKey = character.getEntity();
            return (
              entityKey !== null &&
              contentState.getEntity(entityKey).getType() === 'LINK'
            );
          },
          callback
        );
      }

      const Link = (props) => {
        const {url} = props.contentState.getEntity(props.entityKey).getData();
        return (
          <a href={url} style={styles.link}>
            {props.children}
          </a>
        );
      };

      function findImageEntities(contentBlock, callback, contentState) {
        contentBlock.findEntityRanges(
          (character) => {
            const entityKey = character.getEntity();
            return (
              entityKey !== null &&
              contentState.getEntity(entityKey).getType() === 'IMAGE'
            );
          },
          callback
        );
      }

      const Image = (props) => {
        const {
          height,
          src,
          width,
        } = props.contentState.getEntity(props.entityKey).getData();

        return (
          <img src={src} height={height} width={width} />
        );
      };