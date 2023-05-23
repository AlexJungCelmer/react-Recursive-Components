import React, { useEffect, useState, useRef } from 'react';

//maker Only Components
import TextComponent from './components/Text';
import BlockComponent from './components/Block';
import ContainerComponent from './components/Container';

//outside maker components
import MouseSelectionPopUp from './components/MouseSelectionPopUp';

interface ComponentProps {
  id: string;
  name: string;
  props?: { [key: string]: string }[];
  children?: ComponentProps[];
}

interface JSONData {
  components: ComponentProps[];
}

const componentMap: { [key: string]: React.ComponentType<any> } = {
  text: TextComponent,
  block: BlockComponent,
  container: ContainerComponent,
};

const renderComponent = (component: ComponentProps): JSX.Element | null => {
  const Component = componentMap[component.name];

  return (
    <Component key={component.id} props={component.props} >
      {component.children && component.children.map(child => renderComponent(child))}
      {null}
    </Component>
  );
};

const renderComponents = (components: ComponentProps[] | undefined): JSX.Element[] | null => {
  if (!components) return null;

  return components.map(component => renderComponent(component)).filter(Boolean) as JSX.Element[];
};



const App: React.FC = () => {
  const selectedTextRef = useRef<string>('');
  const [jsonData, setJsonData] = useState<JSONData | null>(null);
  const [showMouseSelectionPopUp, setShowMouseSelectionPopUp] = useState<boolean | null>(false)

  useEffect(() => {
    const fetchJSONData = async () => {
      try {
        const response = await fetch('components.json');
        const data = await response.json();
        setJsonData(data);
      } catch (error) {
        console.error('Error fetching JSON data:', error);
      }
    };
    fetchJSONData();
    loadHighlights();
  }, []);
  const wrapSelectedText = (node: Node, range: Range) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const { startOffset, endOffset } = range;
      const selectedText = textNode.textContent?.substring(startOffset, endOffset);

      if (selectedText) {
        const wrapper = document.createElement('span');
        wrapper.style.backgroundColor = 'yellow'; // Estilo de exemplo, você pode modificar isso conforme necessário
        wrapper.classList.add('textHighlight')
        const highlightedText = document.createTextNode(selectedText);
        wrapper.appendChild(highlightedText);

        const parentElement = textNode.parentNode;
        if (parentElement) {
          const beforeRangeText = textNode.textContent?.substring(0, startOffset);
          const afterRangeText = textNode.textContent?.substring(endOffset);

          if (beforeRangeText) {
            const beforeRangeTextNode = document.createTextNode(beforeRangeText);
            parentElement.insertBefore(beforeRangeTextNode, textNode);
          }

          parentElement.insertBefore(wrapper, textNode);

          if (afterRangeText) {
            const afterRangeTextNode = document.createTextNode(afterRangeText);
            parentElement.insertBefore(afterRangeTextNode, textNode.nextSibling);
          }

          textNode.textContent = ''; // Limpa o texto do nó original
        }
      }
    } else {
      const childNodes = node.childNodes;
      for (let i = 0; i < childNodes.length; i++) {
        wrapSelectedText(childNodes[i], range);
      }
    }
  }


  const handleTextSelection = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      wrapSelectedText(range.commonAncestorContainer, range);
      selection.removeAllRanges();
      saveHighlights()
    }
  }

  const saveHighlights = () => {
    const highlights = Array.from(document.querySelectorAll('span.textHighlight')).map((span) => span.textContent);
    localStorage.setItem('highlights', JSON.stringify(highlights));
  };

  const loadHighlights = () => {
    const storedHighlights = localStorage.getItem('highlights');
    if (storedHighlights) {
      const highlights = JSON.parse(storedHighlights);
      const wrapper = document.createElement('div'); // Criar um novo elemento <div> para envolver as marcações
      wrapper.className = 'highlight-wrapper';
      highlights.forEach((highlight: string) => {
        const span = document.createElement('span');
        span.className = 'highlight';
        span.textContent = highlight;
        wrapper.appendChild(span);
      });
      // selectedTextRef.current?.appendChild(wrapper);
    }
  };



  const handleMouseDown = () => {
    setShowMouseSelectionPopUp(false)
  }

  return (
    <div>
      <div onMouseUp={(event) => handleTextSelection(event)} onMouseDown={handleMouseDown}>
        {jsonData ? (
          renderComponents(jsonData.components)
        ) : (
          <p>Loading JSON data...</p>
        )}
      </div>
      {showMouseSelectionPopUp &&
        <MouseSelectionPopUp />
      }
      <div></div>
    </div>
  );
};

export default App;
