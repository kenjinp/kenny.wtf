import React from 'react';
import { ProjectImg, ProjectWrapper } from './Project.style';

export interface ProjectProps {
  title: string;
  body: string;
  projectUrl?: string;
  projectImage?: string;
}

export const Project: React.FC<ProjectProps> = ({ title, body, projectUrl, projectImage }) => {
  return (
    <a href={projectUrl}>
      <ProjectWrapper>
        {projectImage && <ProjectImg src={projectImage} alt={title} />}
        <h3>{title}</h3>
        <p>{body}</p>
      </ProjectWrapper>
    </a>
  );
};
