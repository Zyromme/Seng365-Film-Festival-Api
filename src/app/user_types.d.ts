type User = {
    id: number;
    /**
     * User id as defined by the database
     */
    user_id: number,
    /**
     * User's email as entered when created
     */
    email: string

    /**
     * User's first name
     */
    firstName: string

    /**
     * User's Last name
     */
    lastName: string

    /**
     * User's password
     */
    password: string
}

type Film = {
    /**
     * Id of the film
     */
    id: number

    /**
     * Title of the film
     */
    title: string

    /**
     * Description of the film
     */
    description: string

    /**
     * Release date of the film
     */
    releaseDate: number

    /**
     * Genreid of the genre of the film
     */
    genreId: number

    /**
     * Filename of the image of the film
     */
    image_filename: string

    /**
     * Runtime of the film
     */
    runtime: number

    /**
     * Age rating of the film
     */
    ageRating: string

    /**
     * DirectorId of the director of the film
     */
    director_id: number
}