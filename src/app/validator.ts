import Ajv from 'ajv';
import * as schemas from './resources/schemas.json';
const ajv = new Ajv({removeAdditional: 'all', strict: false});

const validate = async (schema: object, data: any) => {
    try {
        const validator = ajv.compile(schema);
        const valid = await validator(data);
        if(!valid)
            return ajv.errorsText(validator.errors)
        return true;
    } catch (err) {
        return err.message;
    }
}

export {validate}