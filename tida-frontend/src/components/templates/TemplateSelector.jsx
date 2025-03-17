// src/components/templates/TemplateSelector.jsx
import React from 'react';

export const TEMPLATE_TYPES = {
  simple: {
    id: 'simple',
    name: 'Simple',
    description: 'Basic template with To Do, In Progress, and Done columns',
    icon: (
      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    columns: [
      { name: "To Do", color: "#e2e8f0" },
      { name: "In Progress", color: "#90cdf4" },
      { name: "Done", color: "#9ae6b4" }
    ]
  },
  project_management: {
    id: 'project_management',
    name: 'Project Management',
    description: 'Standard project management workflow',
    icon: (
      <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    columns: [
      { name: "Backlog", color: "#e2e8f0" },
      { name: "To Do", color: "#feb2b2" },
      { name: "In Progress", color: "#90cdf4" },
      { name: "Review", color: "#d6bcfa" },
      { name: "Done", color: "#9ae6b4" }
    ]
  },
  software_development: {
    id: 'software_development',
    name: 'Software Development',
    description: 'Detailed workflow for software development teams',
    icon: (
      <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    columns: [
      { name: "Backlog", color: "#e2e8f0" },
      { name: "To Do", color: "#feb2b2" },
      { name: "Development", color: "#90cdf4" },
      { name: "Testing", color: "#fbd38d" },
      { name: "Code Review", color: "#d6bcfa" },
      { name: "Ready for Deploy", color: "#9ae6b4" },
      { name: "Done", color: "#68d391" }
    ]
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Workflow for marketing campaigns and content',
    icon: (
      <svg className="h-10 w-10 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    columns: [
      { name: "Ideas", color: "#e2e8f0" },
      { name: "Planning", color: "#feb2b2" },
      { name: "Content Creation", color: "#90cdf4" },
      { name: "Review", color: "#fbd38d" },
      { name: "Pending Approval", color: "#d6bcfa" },
      { name: "Published", color: "#9ae6b4" },
      { name: "Analysis", color: "#68d391" }
    ]
  },
  design: {
    id: 'design',
    name: 'Design',
    description: 'Workflow for design projects and assets',
    icon: (
      <svg className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    columns: [
      { name: "Requests", color: "#e2e8f0" },
      { name: "Research", color: "#feb2b2" },
      { name: "Draft", color: "#90cdf4" },
      { name: "Design", color: "#fbd38d" },
      { name: "Feedback", color: "#d6bcfa" },
      { name: "Revision", color: "#bee3f8" },
      { name: "Approved", color: "#9ae6b4" }
    ]
  },
  product_development: {
    id: 'product_development',
    name: 'Product Development',
    description: 'End-to-end product development lifecycle',
    icon: (
      <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    columns: [
      { name: "Idea Pool", color: "#e2e8f0" },
      { name: "Research", color: "#feb2b2" },
      { name: "MVP", color: "#90cdf4" },
      { name: "Testing", color: "#fbd38d" },
      { name: "Development", color: "#d6bcfa" },
      { name: "Market Launch", color: "#9ae6b4" },
      { name: "Feedback", color: "#68d391" }
    ]
  },
  customer_service: {
    id: 'customer_service',
    name: 'Customer Service',
    description: 'Customer support ticket workflow',
    icon: (
      <svg className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    columns: [
      { name: "New Requests", color: "#e2e8f0" },
      { name: "Evaluation", color: "#feb2b2" },
      { name: "Processing", color: "#90cdf4" },
      { name: "On Hold", color: "#fbd38d" },
      { name: "Resolved", color: "#9ae6b4" },
      { name: "Closed", color: "#68d391" }
    ]
  },
  event_planning: {
    id: 'event_planning',
    name: 'Event Planning',
    description: 'Comprehensive event planning workflow',
    icon: (
      <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    columns: [
      { name: "Ideas", color: "#e2e8f0" },
      { name: "Planning", color: "#feb2b2" },
      { name: "Budget Approval", color: "#90cdf4" },
      { name: "Vendor Communication", color: "#fbd38d" },
      { name: "Logistics", color: "#d6bcfa" },
      { name: "Marketing", color: "#bee3f8" },
      { name: "Event Day", color: "#9ae6b4" },
      { name: "Post Evaluation", color: "#68d391" }
    ]
  }
};

const TemplateSelector = ({ selected, onChange, showPreview = true }) => {
  const templateOptions = Object.values(TEMPLATE_TYPES);
  
  return (
    <div className="template-selector space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Select a Template</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {templateOptions.map((template) => (
          <div 
            key={template.id}
            className={`template-option border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selected === template.id 
                ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onChange(template.id)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-2">
                {template.icon}
              </div>
              <h4 className="font-medium text-gray-800">{template.name}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {showPreview && selected && (
        <div className="template-preview mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Column Preview</h4>
          <div className="flex space-x-2 overflow-x-auto pb-2 rounded border border-gray-200 p-3 bg-gray-50">
            {TEMPLATE_TYPES[selected].columns.map((column, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-28 p-2 rounded shadow-sm"
                style={{ backgroundColor: column.color }}
              >
                <div className="text-xs font-medium text-gray-700">{column.name}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {TEMPLATE_TYPES[selected].columns.length} columns will be created with this template
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;