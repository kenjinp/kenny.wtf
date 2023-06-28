import styled from 'styled-components';

export const ProjectWrapper = styled.div`
  width: 100%;
  background: var(--idx7);
  padding: 1rem;
  p,
  h2,
  h3,
  h4 {
    text-shadow: none;
  }
`;

export const ProjectList = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 1rem;
`;

export const ProjectImg = styled.img`
  width: 100%;
`;
