import { randomUUID } from 'node:crypto';

import { Database } from "./database.js";
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const search = req.query;

      if(search.title || search.description) {
        return res.end(JSON.stringify(database.select('tasks', search)));
      }

      return res.end(JSON.stringify(database.select('tasks')));
    },
  },

  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body;

      if(!title) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title is requerid'})
        );
      };

      if(!description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'Description is requerid'})
        );
      };

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert('tasks', task);

      return res.writeHead(201).end();
    },
  },

  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if(!title || !description) {
        return res.writeHead(400).end(JSON.stringify({message: 'title or description are required'}));
      };

      const [task] = database.select('tasks', { id });

      if(!task) {
        return res.writeHead(404).end(JSON.stringify({message: 'Task not found'}));
      };

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      });

      return res.writeHead(204).end();
    },
  },

  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id });
      
      if(!task || task.id !== id) {
        return res.writeHead(404).end(JSON.stringify({message: 'Tasks not found'}));
      };

      database.delete('tasks', id);

      return res.writeHead(204).end();
    },
  },

  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id });

      if(!task || task.id !== id) {
        return res.writeHead(404).end(JSON.stringify({message: 'Task not found'}));
      };

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update('tasks', id, { completed_at });

      return res.writeHead(204).end();
    },
  },

];