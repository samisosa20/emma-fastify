import { FastifyRequest, FastifyReply } from "fastify";

import { formatErrorMessage } from "@lib";

import { BadgeUseCase } from "packages/badge/application/badge.use-case";
import { BadgePrismaRepository } from "packages/badge/infrastructure/badge.repository";
import { CreateBadge } from "packages/badge/domain/badge";

type BadgeParams = {
  page: number;
  deleted?: "1" | "0";
  size?: number;
};

const badgeRepository = new BadgePrismaRepository();
const badgeUseCase = new BadgeUseCase(badgeRepository);

export class BadgeController {
  getAllBadges = async (request: FastifyRequest, reply: FastifyReply) => {
    const params = request.query as BadgeParams;

    return await badgeUseCase.listBadge(params);
  };

  addBadge = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataBadge = request.body as CreateBadge;

    try {
      return badgeUseCase.addBadge(dataBadge);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Badge creation failed",
        message: detail,
      });
    }
  };

  updateBadge = async (request: FastifyRequest, reply: FastifyReply) => {
    const dataBadge = request.body as CreateBadge;
    const { id } = request.params as { id: string };

    try {
      return badgeUseCase.updateBadge(id, dataBadge);
    } catch (error: any) {
      const detail = formatErrorMessage(error);
      return reply.status(400).send({
        statusCode: 400,
        error: "Badge update failed",
        message: detail,
      });
    }
  };

  detailBadge = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return badgeUseCase.detailBadge(id);
  };

  deleteBadge = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    return await badgeUseCase.deleteBadge(id);
  };
}
