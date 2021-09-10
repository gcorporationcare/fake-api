const express = require('express');
const utils = require('./utils');

const models = ['albums', 'comments', 'photos', 'posts', 'todos', 'users'];

/**
 * Generate endpoint for all existing models
 * @returns a express compatible route object
 */
const provideRoutes = () => {
    const routes = {};
    models.forEach((model) => {
        const router = express.Router();
        router.get(utils.PATHS.root, (req,res) => {
            return utils.getPage(model, req, res);
        });

        router.get(utils.PATHS.id, (req,res) => {
            return utils.get(model, req, res);
        });

        router.post(utils.PATHS.root, (req,res) => {
            return utils.post(model, req, res);
        });

        router.put(utils.PATHS.id, (req,res) => {
            return utils.put(model, req, res);
        });

        router.delete(utils.PATHS.id, (req,res) => {
            return utils.remove(model, req, res);
        });

        router.delete(utils.PATHS.root, (req,res) => {
            return utils.removeAll(model, req, res);
        });
        routes[model] = router;
    });
    return routes;
};
exports.endpoints = provideRoutes();
