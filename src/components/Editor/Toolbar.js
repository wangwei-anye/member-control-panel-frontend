import React from 'react';
import config from 'config/editor.config';

const any = (...names) => names.some(it => config.toolbar.indexOf(it) > -1);

const Toolbar = props => (
  <div {...props}>
    {any('font', 'size') ? (
      <span className="ql-formats">
        {any('font') ? <select className="ql-font" /> : null}
        {any('size') ? <select className="ql-size" /> : null}
      </span>
    ) : null}
    {any('bold', 'italic', 'underline', 'strike') ? (
      <span className="ql-formats">
        {any('bold') ? <button className="ql-bold" /> : null}
        {any('italic') ? <button className="ql-italic" /> : null}
        {any('underline') ? <button className="ql-underline" /> : null}
        {any('strike') ? <button className="ql-strike" /> : null}
      </span>
    ) : null}
    {any('color', 'background') ? (
      <span className="ql-formats">
        {any('color') ? <select className="ql-color" /> : null}
        {any('background') ? <select className="ql-background" /> : null}
      </span>
    ) : null}
    {any('align', 'direction', 'indent') ? (
      <span className="ql-formats">
        {any('align') ? <select className="ql-align" /> : null}
        {any('direction') ? <button className="ql-direction" /> : null}
        {any('indent') ? <button className="ql-indent" value="-1" /> : null}
        {any('indent') ? <button className="ql-indent" value="+1" /> : null}
      </span>
    ) : null}
    {any('script') ? (
      <span className="ql-formats">
        <button className="ql-script" value="sub" />
        <button className="ql-script" value="super" />
      </span>
    ) : null}
    {any('blockquote', 'code-block') ? (
      <span className="ql-formats">
        {any('blockquote') ? <button className="ql-blockquote" /> : null}
        {any('code-block') ? <button className="ql-code-block" /> : null}
      </span>
    ) : null}
    {any('list') ? (
      <span className="ql-formats">
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
      </span>
    ) : null}
    {any('link', 'image', 'video') ? (
      <span className="ql-formats">
        {any('link') ? <button className="ql-link" /> : null}
        {any('image') ? (
          <button className="ql-cus-image">
            <svg viewBox="0 0 18 18">
              <rect className="ql-stroke" height="10" width="12" x="3" y="4" />
              <circle className="ql-fill" cx="6" cy="7" r="1" />
              <polyline
                className="ql-even ql-fill"
                points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"
              />
            </svg>
          </button>
        ) : null}
        {any('video') ? <button className="ql-video" /> : null}
      </span>
    ) : null}
    {any('clean') ? (
      <span className="ql-formats">
        <button className="ql-clean" />
      </span>
    ) : null}
  </div>
);

export default Toolbar;
