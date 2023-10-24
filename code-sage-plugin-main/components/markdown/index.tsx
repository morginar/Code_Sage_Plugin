/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import cx from 'classnames';
import React from 'react';
import { FC, ReactNode, useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { BsClipboard } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import reactNodeToString from 'react-node-to-string';
import rehypeHighlight from 'rehype-highlight';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import supersub from 'remark-supersub';

import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import less from 'highlight.js/lib/languages/less';
import scss from 'highlight.js/lib/languages/scss';
import shell from 'highlight.js/lib/languages/shell';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark.css';
// import hljsDefineSolidity from 'highlightjs-solidity';
import 'katex/dist/katex.min.css';

const languageMap = {
  jsx: javascript,
  js: javascript,
  javascript: javascript,
  java: java,
  csharp: csharp,
  ts: typescript,
  typescript: typescript,
  shell: shell,
  css: css,
  less: less,
  scss: scss,
  json: json,
  python: python
};

// hljsDefineSolidity(hljs);
for (const lang in languageMap) {
  hljs.registerLanguage(lang, (languageMap as any)[lang]);
}
hljs.highlightAll();
hljs.initHighlightingOnLoad();

function CustomCode(props: { children: ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () => reactNodeToString(props.children),
    [props.children]
  );

  return (
    <div className="flex flex-col">
      <div className="bg-[#e6e7e8] dark:bg-[#444a5354]">
        <CopyToClipboard
          text={code}
          onCopy={() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1000);
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            <BsClipboard />
            <span>{copied ? 'copied' : 'copy code'}</span>
          </div>
        </CopyToClipboard>
      </div>
      <code className={cx(props.className, 'px-4')}>{props.children}</code>
    </div>
  );
}

const Markdown: FC<{ children: string }> = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, supersub, remarkBreaks, remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      className={`markdown-body markdown-custom-styles`}
      linkTarget="_blank"
      components={{
        a: ({ node: _, ...props }) => {
          if (!props.title) {
            return <a {...props} />;
          }
          return <a {...props} title={props.title} />;
        },
        code: ({ node: _, inline, className, children, ...props }) => {
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
          return <CustomCode className={className}>{children}</CustomCode>;
        }
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export default Markdown;
