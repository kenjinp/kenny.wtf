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
        {projectImage && <ProjectImg  src={projectImage} alt={title} />}
        <h4>{title}</h4>
        <h4>{body}</h4>
      </ProjectWrapper>
    </a>
  );
};
