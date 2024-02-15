import { Space } from "../models/Space";
import { User } from "../models/User";

export const newSpace = async (req, res) => {   
    try {
        const newSpace = new Space(
            {
                icon: req.body.icon,
                iconBg: req.body.iconBg,
                name: req.body.name,
                description: req.body.description,
                users: [req.body.user],
            }
        );
        const savedSpace = await newSpace.save();
        res.json(savedSpace);
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar el space', error: err });
    }
}

export const getSpaces = async (req, res) => {
    try {
        const spaces = await Space.find({});
        res.json(spaces);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los espacios', error: err });
    }
}

export const getMySpaces = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const spaces = await Space.find({ name: { $in: user.spaces } });
        res.json(spaces);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los espacios', error: err });
    }
}

export const getNewSpaces = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const spaces = await Space.find({ name: { $not: { $in: user.spaces } } });
        res.json(spaces);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los espacios', error: err });
    }
}