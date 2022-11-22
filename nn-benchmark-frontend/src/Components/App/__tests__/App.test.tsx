import App from "Components/App/App";
import { HashRouter } from "react-router-dom";

import { render, screen } from "@testing-library/react";

test('renders app', () => {
  render(
    <HashRouter>
      <App />
    </HashRouter>
  );
  const headerElement = screen.getByText('Neural Networks');
  expect(headerElement).toBeInTheDocument();
});
