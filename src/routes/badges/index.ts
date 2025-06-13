import { BadgeController } from "@controllers";
import {
  createBadgeDocumentation,
  deleteBadgeDocumentation,
  getBadgeDocumentation,
  updateBadgeDocumentation,
  listBadgesDocumentation,
} from "src/documentation";
import { FastifyPluginAsync } from "fastify";

import { validateBadgeCreate, validateBadgeUpdate } from "packages/shared";

const badgesRoutes: FastifyPluginAsync = async (fastify) => {
  const badgeController = new BadgeController();

  // Get all Badges
  fastify.get(
    "/",
    {
      preHandler: [],
      schema: listBadgesDocumentation,
    },
    badgeController.getAllBadges
  );

  // Create a new Badge
  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate, validateBadgeCreate],
      schema: createBadgeDocumentation,
    },
    badgeController.addBadge
  );

  // Get a Badge by ID
  fastify.get(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: getBadgeDocumentation,
    },
    badgeController.detailBadge
  );

  // Update a Badge by ID
  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate, validateBadgeUpdate],
      schema: updateBadgeDocumentation,
    },
    badgeController.updateBadge
  );

  // Delete a Badge by ID
  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: deleteBadgeDocumentation,
    },
    badgeController.deleteBadge
  );

  // Delete a Badge by ID
  fastify.post(
    "/import",
    {
      preHandler: [],
    },
    badgeController.importBadge
  );
};

export default badgesRoutes;
