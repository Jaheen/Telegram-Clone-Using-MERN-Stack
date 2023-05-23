import { Request, Response } from "express";
import { SearchService } from "services";

export default class SearchController {

    static search(req: Request, res: Response) {
        const { query } = req.query
        console.log(req.query);

        if (query && (query as string).trim() !== "") {
            SearchService.search(query as string)
                .then(results => res.json({ results }))
        } else
            res.json({ results: [] })
    }
}