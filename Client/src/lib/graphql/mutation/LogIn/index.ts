import {gql} from "apollo-boost";


export const LOG_IN_GOOGLE = gql `
    mutation LogInGoogle($input: LogInInput) {
        logInGoogle(input: $input){
            id
            token
            avatar
            hasWallet
            didRequest
            isadmin
            isreviewer
        }
    }
`;
